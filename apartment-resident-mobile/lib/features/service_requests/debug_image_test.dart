import 'package:flutter/material.dart';
import 'ui/widgets/image_gallery.dart';

class DebugImageTest extends StatelessWidget {
  const DebugImageTest({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Debug Image Test')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Test ImageGridWidget với các URL khác nhau:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Test 1: Empty list
            const Text('Test 1: Empty list'),
            ImageGridWidget(imageUrls: [], crossAxisCount: 3),
            const SizedBox(height: 16),

            // Test 2: Valid image URLs
            const Text('Test 2: Valid image URLs'),
            ImageGridWidget(
              imageUrls: [
                'https://picsum.photos/200/200?random=1',
                'https://picsum.photos/200/200?random=2',
                'https://picsum.photos/200/200?random=3',
              ],
              crossAxisCount: 3,
            ),
            const SizedBox(height: 16),

            // Test 3: Invalid URLs
            const Text('Test 3: Invalid URLs'),
            ImageGridWidget(
              imageUrls: ['invalid-url-1', 'invalid-url-2'],
              crossAxisCount: 2,
            ),
            const SizedBox(height: 16),

            // Test 4: Mixed URLs
            const Text('Test 4: Mixed URLs'),
            ImageGridWidget(
              imageUrls: [
                'https://picsum.photos/200/200?random=4',
                'invalid-url',
                'https://picsum.photos/200/200?random=5',
              ],
              crossAxisCount: 3,
            ),
          ],
        ),
      ),
    );
  }
}
