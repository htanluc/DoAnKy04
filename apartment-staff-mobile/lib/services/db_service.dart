import 'dart:async';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

class DbService {
  static Database? _db;

  static Future<Database> _open() async {
    if (_db != null) return _db!;
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'staff_app.db');
    _db = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS assigned_requests(
            id INTEGER PRIMARY KEY,
            resident_name TEXT,
            resident_phone TEXT,
            category_name TEXT,
            description TEXT,
            priority TEXT,
            status TEXT,
            submitted_at TEXT
          );
        ''');
      },
    );
    return _db!;
  }

  static Future<void> saveAssignedRequests(
      List<Map<String, dynamic>> items) async {
    final db = await _open();
    final batch = db.batch();
    for (final it in items) {
      batch.insert(
        'assigned_requests',
        {
          'id': it['id'],
          'resident_name':
              it['residentName'] ?? it['userName'] ?? it['user']?['username'],
          'resident_phone': it['userPhone'] ?? it['user']?['phoneNumber'],
          'category_name':
              it['categoryName'] ?? it['category']?['categoryName'],
          'description': it['description'],
          'priority': it['priority']?.toString(),
          'status': it['status']?.toString(),
          'submitted_at':
              it['createdAt']?.toString() ?? it['submittedAt']?.toString(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    await batch.commit(noResult: true);
  }

  static Future<List<Map<String, dynamic>>> loadAssignedRequests() async {
    final db = await _open();
    final rows =
        await db.query('assigned_requests', orderBy: 'submitted_at DESC');
    return rows;
  }

  static Future<void> clearAssignedRequests() async {
    final db = await _open();
    await db.delete('assigned_requests');
  }
}
