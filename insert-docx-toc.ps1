param(
    [Parameter(Mandatory = $true)]
    [string]$InputDocx,

    [string]$OutputDocx = ''
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $InputDocx)) {
    throw "File not found: $InputDocx"
}

if ([string]::IsNullOrWhiteSpace($OutputDocx)) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($InputDocx)
    $resolved = (Resolve-Path -LiteralPath $InputDocx).Path
    $dir = [System.IO.Path]::GetDirectoryName($resolved)
    $OutputDocx = Join-Path $dir ("${base}_with_TOC.docx")
}

# Create Word COM object
$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    $doc = $word.Documents.Open(((Resolve-Path -LiteralPath $InputDocx).Path))

    # Go to start of document and insert a heading for TOC if needed
    $selection = $word.Selection
    $selection.HomeKey(6) # wdStory

    # Insert TOC heading if not present at top
    $tocHeadingText = 'Table of Contents'
    $rangeStart = $doc.Range(0, [ref]0)
    $existingTopText = $doc.Range(0, [Math]::Min(200, $doc.Range().Text.Length)).Text
    if ($existingTopText -notmatch [Regex]::Escape($tocHeadingText)) {
        $selection.TypeText($tocHeadingText)
        $selection.TypeParagraph()
    }

    # Insert TOC (use minimal overload to avoid COM signature issues)
    $tocRange = $selection.Range
    $toc = $doc.TablesOfContents.Add($tocRange, $true, 1, 3)
    try { $toc.RightAlignPageNumbers = $true } catch {}
    try { $toc.UseHyperlinks = $true } catch {}

    # Insert a page break after TOC
    $selection.EndKey(6)
    $selection.InsertBreak(7) # wdPageBreak

    # Page numbers in footer: Page X of Y, start numbering after TOC
    # Create a section break so content starts new section
    $selection.InsertBreak(7) # ensure a new page for safety

    # Ensure different first page for first section (cover/TOC)
    foreach ($section in $doc.Sections) {
        $section.PageSetup.DifferentFirstPageHeaderFooter = $true
    }

    # Add page numbers to all sections in footer, aligned right
    $wdHeaderFooterPrimary = 1
    $wdAlignTabRight = -2
    $wdTabLeaderDots = 1

    foreach ($section in $doc.Sections) {
        $footer = $section.Footers.Item($wdHeaderFooterPrimary)
        $range = $footer.Range
        $range.ParagraphFormat.Alignment = 2 # wdAlignParagraphCenter by default we'll insert fields

        # Clear existing content to avoid duplicates
        $range.Text = ''

        # Insert 'Page '
        $range.InsertAfter('Page ')
        $range.Collapse(0) # wdCollapseEnd
        $range.Fields.Add($range, -1) # wdFieldPage
        $range.Collapse(0)
        $range.InsertAfter(' of ')
        $range.Collapse(0)
        $range.Fields.Add($range, -1) # wdFieldNumPages

        # Align right with dots leader
        $tabStops = $range.ParagraphFormat.TabStops
        $tabStops.ClearAll()
        $tabStops.Add($word.InchesToPoints(6.5), $wdAlignTabRight, $wdTabLeaderDots) | Out-Null
    }

    # Update TOC and fields
    $toc.Update()
    $doc.Fields.Update()

    # Save As new file
    $doc.SaveAs($OutputDocx)
} finally {
    if ($doc) { $doc.Close($true) }
    if ($word) { $word.Quit() }
}

Write-Host "Created: $OutputDocx"
