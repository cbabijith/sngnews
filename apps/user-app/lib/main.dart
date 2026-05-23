import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  );
  
  runApp(const UserApp());
}

class UserApp extends StatelessWidget {
  const UserApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SNG News User App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
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
  List<dynamic> categories = [];
  List<dynamic> newsItems = [];
  bool isLoading = true;
  String? error;
  String? selectedCategory;

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
          .select('*, categories(name, slug)')
          .eq('is_published', true)
          .order('published_at', ascending: true)
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

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SNG News'),
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
              : Column(
                  children: [
                    // Categories horizontal scroll
                    if (categories.isNotEmpty)
                      Container(
                        height: 80,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          itemCount: categories.length + 1,
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: FilterChip(
                                  label: const Text('All'),
                                  selected: selectedCategory == null,
                                  onSelected: (selected) {
                                    setState(() {
                                      selectedCategory = selected ? null : null;
                                    });
                                  },
                                ),
                              );
                            }
                            final category = categories[index - 1];
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(category['name']),
                                selected: selectedCategory == category['id'],
                                onSelected: (selected) {
                                  setState(() {
                                    selectedCategory = selected ? category['id'] : null;
                                  });
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    // News list
                    Expanded(
                      child: newsItems.isEmpty
                          ? const Center(child: Text('No news items found'))
                          : ListView.builder(
                              itemCount: newsItems.length,
                              itemBuilder: (context, index) {
                                final item = newsItems[index];
                                if (selectedCategory != null && item['category_id'] != selectedCategory) {
                                  return const SizedBox.shrink();
                                }
                                return Card(
                                  margin: const EdgeInsets.all(8),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (item['categories'] != null)
                                          Chip(
                                            label: Text(item['categories']['name']),
                                            backgroundColor: Colors.blue.shade100,
                                          ),
                                        const SizedBox(height: 8),
                                        Text(
                                          item['title'] ?? 'No title',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        if (item['description'] != null)
                                          Text(
                                            item['description'],
                                            style: const TextStyle(color: Colors.grey),
                                          ),
                                        if (item['image_url'] != null) ...[
                                          const SizedBox(height: 12),
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(8),
                                            child: Image.network(
                                              item['image_url'],
                                              fit: BoxFit.cover,
                                              errorBuilder: (context, error, stackTrace) {
                                                return const Icon(Icons.broken_image);
                                              },
                                            ),
                                          ),
                                        ],
                                        if (item['content'] != null) ...[
                                          const SizedBox(height: 12),
                                          Text(
                                            item['content'],
                                            style: const TextStyle(color: Colors.black87),
                                          ),
                                        ],
                                        if (item['youtube_link'] != null) ...[
                                          const SizedBox(height: 12),
                                          ElevatedButton.icon(
                                            onPressed: () => _launchUrl(item['youtube_link']),
                                            icon: const Icon(Icons.play_arrow),
                                            label: const Text('Watch on YouTube'),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.red,
                                              foregroundColor: Colors.white,
                                            ),
                                          ),
                                        ],
                                        if (item['published_at'] != null)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 8),
                                            child: Text(
                                              'Published: ${DateTime.parse(item['published_at']).toString().split('.')[0]}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
    );
  }
}
