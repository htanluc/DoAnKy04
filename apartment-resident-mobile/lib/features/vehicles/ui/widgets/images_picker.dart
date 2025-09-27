import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class ImagesPicker extends StatefulWidget {
  const ImagesPicker({super.key, required this.onPicked, this.maxImages = 5});

  final ValueChanged<List<XFile>> onPicked;
  final int maxImages;

  @override
  State<ImagesPicker> createState() => _ImagesPickerState();
}

class _ImagesPickerState extends State<ImagesPicker> {
  final ImagePicker _picker = ImagePicker();
  List<XFile> _files = const [];

  Future<void> _pick() async {
    final remain = widget.maxImages - _files.length;
    if (remain <= 0) return;
    final res = await _picker.pickMultiImage(imageQuality: 85);
    if (res.isEmpty) return;
    final selected = res.take(remain).toList();
    setState(() => _files = [..._files, ...selected]);
    widget.onPicked(_files);
  }

  void _remove(int index) {
    setState(() => _files = List.of(_files)..removeAt(index));
    widget.onPicked(_files);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (int i = 0; i < _files.length; i++)
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(
                      File(_files[i].path),
                      height: 80,
                      width: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 80,
                          width: 80,
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.broken_image,
                            color: Colors.grey,
                          ),
                        );
                      },
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: InkWell(
                      onTap: () => _remove(i),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: const Icon(
                          Icons.close,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            if (_files.length < widget.maxImages)
              OutlinedButton.icon(
                onPressed: _pick,
                icon: const Icon(Icons.add_a_photo),
                label: const Text('Chọn ảnh'),
              ),
          ],
        ),
      ],
    );
  }
}
