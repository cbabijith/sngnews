import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  
  runApp(const AdminApp());
}

class AdminApp extends StatelessWidget {
  const AdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SNG News Admin App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final supabase = Supabase.instance.client;
  List<dynamic> newsItems = [];
  List<dynamic> categories = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    try {
      final categoriesResponse = await supabase
          .from('categories')
          .select('*')
          .order('name');
      
      final newsResponse = await supabase
          .from('news')
          .select('*, categories(name)')
          .order('created_at', ascending: true)
          .limit(20);
      
      setState(() {
        categories = categoriesResponse;
        newsItems = newsResponse;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  Future<void> deleteNews(int id) async {
    try {
      await supabase.from('news').delete().eq('id', id);
      fetchData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting: $e')),
      );
    }
  }

  Future<void> togglePublishStatus(Map<String, dynamic> item) async {
    try {
      await supabase
          .from('news')
          .update({
            'is_published': !item['is_published'],
            'published_at': !item['is_published'] ? DateTime.now().toIso8601String() : null,
          })
          .eq('id', item['id']);
      fetchData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SNG News Admin'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: fetchData,
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text('Error: $error'))
              : newsItems.isEmpty
                  ? const Center(child: Text('No news items found'))
                  : ListView.builder(
                      itemCount: newsItems.length,
                      itemBuilder: (context, index) {
                        final item = newsItems[index];
                        return Card(
                          margin: const EdgeInsets.all(8),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: item['is_published'] ? Colors.green.shade100 : Colors.yellow.shade100,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        item['is_published'] ? 'Published' : 'Draft',
                                        style: TextStyle(
                                          color: item['is_published'] ? Colors.green.shade800 : Colors.yellow.shade800,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                    if (item['categories'] != null) ...[
                                      const SizedBox(width: 8),
                                      Chip(
                                        label: Text(item['categories']['name']),
                                        backgroundColor: Colors.blue.shade100,
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  item['title'] ?? 'No title',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (item['description'] != null) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    item['description'],
                                    style: const TextStyle(color: Colors.grey),
                                  ),
                                ],
                                if (item['image_url'] != null) ...[
                                  const SizedBox(height: 12),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      item['image_url'],
                                      height: 150,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return const Icon(Icons.broken_image, size: 150);
                                      },
                                    ),
                                  ),
                                ],
                                if (item['youtube_link'] != null) ...[
                                  const SizedBox(height: 8),
                                  const Icon(Icons.play_circle_outline, color: Colors.red),
                                  Text(
                                    'YouTube: ${item['youtube_link']}',
                                    style: const TextStyle(color: Colors.blue),
                                  ),
                                ],
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    ElevatedButton.icon(
                                      onPressed: () => togglePublishStatus(item),
                                      icon: Icon(item['is_published'] ? Icons.visibility_off : Icons.visibility),
                                      label: Text(item['is_published'] ? 'Unpublish' : 'Publish'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: item['is_published'] ? Colors.yellow : Colors.green,
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton.icon(
                                      onPressed: () {
                                        // TODO: Implement edit functionality
                                      },
                                      icon: const Icon(Icons.edit),
                                      label: const Text('Edit'),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton.icon(
                                      onPressed: () => deleteNews(item['id']),
                                      icon: const Icon(Icons.delete),
                                      label: const Text('Delete'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.red,
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
