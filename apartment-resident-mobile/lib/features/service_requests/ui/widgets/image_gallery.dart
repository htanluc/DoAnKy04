import 'dart:io';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../../../../core/app_config.dart';

class ImageGalleryWidget extends StatelessWidget {
  final List<String> imageUrls;
  final int initialIndex;
  final String? token;

  const ImageGalleryWidget({
    Key? key,
    required this.imageUrls,
    this.initialIndex = 0,
    this.token,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Hình ảnh ${initialIndex + 1}/${imageUrls.length}',
          style: const TextStyle(color: Colors.white),
        ),
        actions: [
          if (imageUrls.length > 1)
            IconButton(
              icon: const Icon(Icons.info_outline, color: Colors.white),
              onPressed: () => _showImageInfo(context),
            ),
        ],
      ),
      body: PhotoViewGallery.builder(
        itemCount: imageUrls.length,
        builder: (context, index) {
          return PhotoViewGalleryPageOptions(
            imageProvider: NetworkImage(_getImageUrl(imageUrls[index])),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 2,
            heroAttributes: PhotoViewHeroAttributes(tag: 'image_$index'),
          );
        },
        pageController: PageController(initialPage: initialIndex),
        backgroundDecoration: const BoxDecoration(color: Colors.black),
        enableRotation: true,
      ),
    );
  }

  String _getImageUrl(String rawUrl) {
    if (rawUrl.startsWith('http')) {
      // Replace localhost with the correct IP for mobile
      String correctedUrl = rawUrl.replaceAll('localhost', '10.0.3.2');
      return correctedUrl;
    }

    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/image-proxy');
    final params = <String, String>{'url': rawUrl};

    if (token != null) {
      params['token'] = token!;
    }

    params['_'] = DateTime.now().millisecondsSinceEpoch.toString();

    return uri.replace(queryParameters: params).toString();
  }

  void _showImageInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thông tin hình ảnh'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tổng số ảnh: ${imageUrls.length}'),
            const SizedBox(height: 8),
            Text('Ảnh hiện tại: ${initialIndex + 1}'),
            const SizedBox(height: 8),
            const Text('Sử dụng cử chỉ để phóng to/thu nhỏ và xoay ảnh'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}

class ImageThumbnailWidget extends StatelessWidget {
  final String imageUrl;
  final VoidCallback onTap;
  final String? token;
  final double? width;
  final double? height;

  const ImageThumbnailWidget({
    Key? key,
    required this.imageUrl,
    required this.onTap,
    this.token,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final fullImageUrl = _getImageUrl(imageUrl);
    print('ImageThumbnailWidget: Loading image: $imageUrl');
    print('ImageThumbnailWidget: Full URL: $fullImageUrl');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width ?? 80,
        height: height ?? 80,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey[300]!),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            fullImageUrl,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) {
                print('ImageThumbnailWidget: Image loaded successfully');
                return child;
              }
              print(
                'ImageThumbnailWidget: Loading progress: ${loadingProgress.cumulativeBytesLoaded}/${loadingProgress.expectedTotalBytes}',
              );
              return Container(
                color: Colors.grey[200],
                child: Center(
                  child: CircularProgressIndicator(
                    value: loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                              loadingProgress.expectedTotalBytes!
                        : null,
                  ),
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              print('ImageThumbnailWidget: Error loading image: $error');
              print('ImageThumbnailWidget: Stack trace: $stackTrace');
              return Container(
                color: Colors.grey[200],
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.broken_image, color: Colors.grey),
                    const SizedBox(height: 4),
                    Text(
                      'Lỗi tải ảnh',
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  String _getImageUrl(String rawUrl) {
    if (rawUrl.startsWith('http')) {
      // Replace localhost with the correct IP for mobile
      String correctedUrl = rawUrl.replaceAll('localhost', '10.0.3.2');
      return correctedUrl;
    }

    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/image-proxy');
    final params = <String, String>{'url': rawUrl};

    if (token != null) {
      params['token'] = token!;
    }

    params['_'] = DateTime.now().millisecondsSinceEpoch.toString();

    return uri.replace(queryParameters: params).toString();
  }
}

class ImageGridWidget extends StatelessWidget {
  final List<String> imageUrls;
  final String? token;
  final int crossAxisCount;
  final double spacing;
  final double childAspectRatio;

  const ImageGridWidget({
    Key? key,
    required this.imageUrls,
    this.token,
    this.crossAxisCount = 3,
    this.spacing = 8.0,
    this.childAspectRatio = 1.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    print('ImageGridWidget: Building with ${imageUrls.length} images');
    print('ImageGridWidget: Image URLs: $imageUrls');

    if (imageUrls.isEmpty) {
      print('ImageGridWidget: No images to display');
      return const SizedBox.shrink();
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: spacing,
        mainAxisSpacing: spacing,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: imageUrls.length,
      itemBuilder: (context, index) {
        print(
          'ImageGridWidget: Building thumbnail $index for ${imageUrls[index]}',
        );
        return ImageThumbnailWidget(
          imageUrl: imageUrls[index],
          token: token,
          onTap: () => _openImageGallery(context, index),
        );
      },
    );
  }

  void _openImageGallery(BuildContext context, int initialIndex) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ImageGalleryWidget(
          imageUrls: imageUrls,
          initialIndex: initialIndex,
          token: token,
        ),
      ),
    );
  }
}

class ImageUploadPreview extends StatelessWidget {
  final List<String> imageUrls;
  final List<File> selectedFiles;
  final VoidCallback onAddImages;
  final Function(int) onRemoveImage;
  final String? token;
  final int maxImages;

  const ImageUploadPreview({
    Key? key,
    required this.imageUrls,
    required this.selectedFiles,
    required this.onAddImages,
    required this.onRemoveImage,
    this.token,
    this.maxImages = 5,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final allImages = [...imageUrls, ...selectedFiles.map((f) => f.path)];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Hình ảnh đính kèm (${allImages.length}/$maxImages)',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            if (allImages.length < maxImages)
              TextButton.icon(
                onPressed: onAddImages,
                icon: const Icon(Icons.add),
                label: const Text('Thêm ảnh'),
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (allImages.isEmpty)
          Container(
            width: double.infinity,
            height: 100,
            decoration: BoxDecoration(
              border: Border.all(
                color: Colors.grey[300]!,
                style: BorderStyle.solid,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: InkWell(
              onTap: onAddImages,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.add_photo_alternate,
                    color: Colors.grey[400],
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Thêm hình ảnh',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                ],
              ),
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: 1,
            ),
            itemCount: allImages.length,
            itemBuilder: (context, index) {
              final isFile = index >= imageUrls.length;
              final imagePath = allImages[index];

              return Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: isFile
                          ? Image.file(File(imagePath), fit: BoxFit.cover)
                          : ImageThumbnailWidget(
                              imageUrl: imagePath,
                              token: token,
                              onTap: () => _openImageGallery(context, index),
                            ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () => onRemoveImage(index),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
      ],
    );
  }

  void _openImageGallery(BuildContext context, int initialIndex) {
    final allImages = [...imageUrls, ...selectedFiles.map((f) => f.path)];
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ImageGalleryWidget(
          imageUrls: allImages,
          initialIndex: initialIndex,
          token: token,
        ),
      ),
    );
  }
}
