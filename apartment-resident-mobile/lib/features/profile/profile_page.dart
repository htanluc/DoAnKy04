import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/storage/secure_storage.dart';
import '../../core/api/api_helper.dart';
import '../../core/api/api_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // Thử nhiều endpoint phổ biến để tương thích backend hiện tại
      Map<String, dynamic>? data;
      try {
        final resp = await ApiHelper.get('/api/auth/me');
        data = jsonDecode(resp.body);
      } catch (_) {}
      setState(() {
        _profile = data ?? {};
      });
    } catch (e) {
      setState(() {
        _error = 'Không thể tải hồ sơ';
      });
    } finally {
      if (mounted)
        setState(() {
          _loading = false;
        });
    }
  }

  String? _avatarUrl() {
    final p = _profile ?? {};
    final user = p['user'] as Map<String, dynamic>?;
    final a1 = user?['avatar']?.toString();
    final a2 = p['avatarUrl']?.toString();
    final a3 = p['avatar']?.toString();
    return a1?.isNotEmpty == true
        ? a1
        : (a2?.isNotEmpty == true ? a2 : (a3?.isNotEmpty == true ? a3 : null));
  }

  String _displayName() {
    final p = _profile ?? {};
    final user = p['user'] as Map<String, dynamic>?;
    return (user?['fullName'] ?? p['fullName'] ?? 'Cư dân').toString();
  }

  Future<void> _pickAndUploadAvatar() async {
    try {
      final picker = ImagePicker();
      final file = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        imageQuality: 85,
      );
      if (file == null) return;
      // Upload avatar - sử dụng multipart request với http package
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiService.baseUrl}/api/auth/me/avatar'),
      );
      final token = await TokenStorage.instance.getToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          filename: 'avatar.jpg',
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('Upload failed: ${response.statusCode}');
      }
      if (!mounted) return;
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật avatar thành công')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Tải avatar thất bại')));
    }
  }

  Future<void> _logout() async {
    await TokenStorage.instance.clear();
    if (context.mounted) {
      Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text(_error!))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundImage: _avatarUrl() != null
                              ? NetworkImage(_avatarUrl()!)
                              : null,
                          child: _avatarUrl() == null
                              ? const Icon(Icons.person, size: 40)
                              : null,
                        ),
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: InkWell(
                            onTap: _pickAndUploadAvatar,
                            child: CircleAvatar(
                              radius: 16,
                              backgroundColor: Theme.of(
                                context,
                              ).colorScheme.primary,
                              child: const Icon(
                                Icons.edit,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      _displayName(),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton.tonal(
                    onPressed: _logout,
                    child: const Text('Đăng xuất'),
                  ),
                ],
              ),
            ),
    );
  }
}

// TODO: Profile UI
