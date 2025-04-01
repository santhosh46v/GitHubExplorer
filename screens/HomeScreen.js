import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = new Animated.Value(0);
  const inputRange = [0, 50];
  const headerHeight = scrollY.interpolate({
    inputRange,
    outputRange: [120, 70],
    extrapolate: 'clamp',
  });

  const searchRepos = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc`
      );
      setRepos(response.data.items);
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    searchRepos();
  };

  const formatStarCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="code-slash-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>
        Search for GitHub repositories to see results here
      </Text>
    </View>
  );

  useEffect(() => {
  const focusListener = navigation.addListener('focus', () => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#24292e');
  });

  return focusListener;
}, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#24292e" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Text style={styles.headerTitle}>GitHub Explorer</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search repositories..."
            placeholderTextColor="#8a8a8a"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => searchRepos()}
          />
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={() => searchRepos()}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Repository List */}
      <AnimatedFlatList
        data={repos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={repos.length === 0 && styles.listContentContainer}
        ListEmptyComponent={!loading && renderEmptyState()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.repoCard}
            onPress={() => navigation.navigate('Details', { repo: item })}
            activeOpacity={0.7}
          >
            <View style={styles.repoHeader}>
              <Image 
                source={{ uri: item.owner.avatar_url }} 
                style={styles.ownerAvatar} 
              />
              <View style={styles.repoInfo}>
                <Text style={styles.repoName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.ownerName}>@{item.owner.login}</Text>
              </View>
            </View>
            
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#f1c40f" />
                <Text style={styles.statText}>
                  {formatStarCount(item.stargazers_count)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="git-branch" size={16} color="#7f8c8d" />
                <Text style={styles.statText}>
                  {item.forks_count}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.languageIndicator, 
                  { backgroundColor: item.language ? getLanguageColor(item.language) : "#ccc" }]} 
                />
                <Text style={styles.statText}>
                  {item.language || "Unknown"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      )}
    </SafeAreaView>
  );
};

// Get a color based on programming language
const getLanguageColor = (language) => {
  const colors = {
    "JavaScript": "#f1e05a",
    "TypeScript": "#2b7489",
    "Python": "#3572A5",
    "Java": "#b07219",
    "C++": "#f34b7d",
    "Swift": "#ffac45",
    "Kotlin": "#F18E33",
    "Ruby": "#701516",
    "Go": "#00ADD8",
    "Rust": "#dea584",
    "PHP": "#4F5D95",
    "C#": "#178600",
    "Shell": "#89e051",
    "Dart": "#00B4AB",
    "Elixir": "#6e4a7e",
  };
  
  return colors[language] || "#8e44ad";
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  header: {
    backgroundColor: '#24292e',
    paddingTop: 10,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  repoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    width: width - 32,
    alignSelf: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
    transform: [{ scale: 1 }],
  },
  
  
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  repoInfo: {
    marginLeft: 12,
    flex: 1,
  },
  repoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  ownerName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#7f8c8d',
  },
  languageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  errorContainer: {
    backgroundColor: '#e74c3c22',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
  },
});

export default HomeScreen;