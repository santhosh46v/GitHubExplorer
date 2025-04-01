import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Share,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites } from '../redux/actions';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { RenderHTML, HTMLElementModel, HTMLContentModel } from 'react-native-render-html';

const DetailsScreen = ({ route, navigation }) => {
  const { repo } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const isFavorite = favorites.some((fav) => fav.id === repo.id);
  
  const [readmeContent, setReadmeContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [240, 200],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    fetchReadme();
    fetchContributors();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.shareButton} onPress={shareRepository}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#1a1e22',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#fff'
    });
  }, []);

  const fetchReadme = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`,
        { headers: { Accept: 'application/vnd.github.v3.html' } }
      );
      
      // Process HTML to ensure images have width constraints
      // Use regex to add style to all images including those in Markdown
      const processedHTML = response.data
        .replace(/<img([^>]*)(>)/g, `<img$1 style="max-width: 100%; height: auto; display: block; margin: 10px 0;" $2`)
        // Fix table overflow
        .replace(/<table/g, '<table style="width: 100%; border-collapse: collapse; overflow-x: auto; display: block;"')
        // Better code block styling
        .replace(/<pre>/g, '<pre style="background-color: #f6f8fa; border-radius: 6px; padding: 16px; overflow-x: auto; font-size: 14px; line-height: 1.45; white-space: pre-wrap; word-break: normal;">')
        // Ensure proper heading spacing
        .replace(/<h1/g, '<h1 style="margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em;"')
        .replace(/<h2/g, '<h2 style="margin-top: 24px; margin-bottom: 16px; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em;"');
      
      setReadmeContent(processedHTML);
    } catch (error) {
      console.error('Error fetching readme:', error);
      setReadmeContent('');
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors?per_page=5`
      );
      setContributors(response.data);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(repo.id));
    } else {
      dispatch(addToFavorites(repo));
    }
  };

  const openInBrowser = () => {
    Linking.openURL(repo.html_url);
  };

  const shareRepository = async () => {
    try {
      await Share.share({
        message: `Check out this GitHub repository: ${repo.name}\n${repo.html_url}`,
        title: `GitHub Repository: ${repo.name}`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

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
    };
    
    return colors[language] || "#8e44ad";
  };

  // Define custom HTML element model for SVG
  const customHTMLElementModels = {
    svg: HTMLElementModel.fromCustomModel({
      tagName: 'svg',
      contentModel: HTMLContentModel.block
    })
  };

  // Define improved tagsStyles for readme content
  const tagsStyles = {
    a: { 
      color: '#0366d6',
      textDecorationLine: 'underline'
    },
    h1: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      marginVertical: 12,
      color: '#24292e',
      borderBottomWidth: 1,
      borderBottomColor: '#eaecef',
      paddingBottom: 8
    },
    h2: { 
      fontSize: 20, 
      fontWeight: 'bold', 
      marginVertical: 10,
      color: '#24292e',
      borderBottomWidth: 1,
      borderBottomColor: '#eaecef',
      paddingBottom: 6
    },
    h3: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      marginVertical: 8,
      color: '#24292e'
    },
    h4: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      marginVertical: 8,
      color: '#24292e'
    },
    code: { 
      backgroundColor: '#f1f1f1', 
      padding: 3,
      borderRadius: 3,
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#24292e'
    },
    pre: {
      backgroundColor: '#f6f8fa',
      padding: 16,
      borderRadius: 6,
      overflow: 'scroll',
      marginVertical: 16
    },
    img: { 
      maxWidth: width - 60,
      height: 'auto',
      marginVertical: 10,
      borderRadius: 4
    },
    p: {
      marginVertical: 8,
      lineHeight: 24
    },
    ul: {
      marginLeft: 8,
      marginVertical: 8
    },
    ol: {
      marginLeft: 8,
      marginVertical: 8
    },
    li: {
      marginVertical: 4,
      lineHeight: 22
    },
    table: {
      borderWidth: 1,
      borderColor: '#dfe2e5',
      marginVertical: 16,
      width: width - 60
    },
    th: {
      backgroundColor: '#f6f8fa',
      padding: 8,
      fontWeight: 'bold',
      borderWidth: 1,
      borderColor: '#dfe2e5'
    },
    td: {
      padding: 8,
      borderWidth: 1,
      borderColor: '#dfe2e5'
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#dfe2e5',
      paddingLeft: 16,
      marginLeft: 0,
      marginVertical: 16,
      fontStyle: 'italic'
    }
  };

  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true
    },
    a: { 
      onPress: (_, href) => Linking.openURL(href) 
    },
    table: {
      renderAsBlock: true
    }
  };

  // Default style for the renderer
  const baseStyle = { 
    fontSize: 16, 
    color: '#24292e', 
    lineHeight: 24,
    fontFamily: 'System' 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1e22" />
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View 
          style={[
            styles.header, 
            { 
              height: headerHeight,
              opacity: headerOpacity
            }
          ]}
        >
          <View style={styles.ownerRow}>
            <Image 
              source={{ uri: repo.owner.avatar_url }} 
              style={styles.avatar} 
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{repo.owner.login}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(repo.owner.html_url)}>
                <Text style={styles.ownerLink}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.repoName}>{repo.name}</Text>
            <TouchableOpacity 
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                color={isFavorite ? "#fff" : "#fff"} 
              />
            </TouchableOpacity>
          </View>

          {repo.description && (
            <Text style={styles.description}>
              {repo.description}
            </Text>
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.statItem}>
            <Ionicons name="star" size={22} color="#f39c12" />
            <Text style={styles.statValue}>{formatNumber(repo.stargazers_count)}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="git-branch" size={22} color="#3498db" />
            <Text style={styles.statValue}>{formatNumber(repo.forks_count)}</Text>
            <Text style={styles.statLabel}>Forks</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Ionicons name="eye" size={22} color="#9b59b6" />
            <Text style={styles.statValue}>{formatNumber(repo.watchers_count)}</Text>
            <Text style={styles.statLabel}>Watchers</Text>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons name="code-outline" size={20} color="#34495e" />
            <Text style={styles.infoLabel}>Language:</Text>
            {repo.language ? (
              <View style={styles.languageContainer}>
                <View 
                  style={[
                    styles.languageDot, 
                    { backgroundColor: getLanguageColor(repo.language) }
                  ]} 
                />
                <Text style={styles.infoValue}>{repo.language}</Text>
              </View>
            ) : (
              <Text style={styles.infoValue}>Not specified</Text>
            )}
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#34495e" />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(repo.created_at)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#34495e" />
            <Text style={styles.infoLabel}>Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(repo.updated_at)}</Text>
          </View>
          
          {repo.license && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#34495e" />
              <Text style={styles.infoLabel}>License:</Text>
              <Text style={styles.infoValue}>{repo.license.name}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="git-network-outline" size={20} color="#34495e" />
            <Text style={styles.infoLabel}>Default Branch:</Text>
            <Text style={styles.infoValue}>{repo.default_branch}</Text>
          </View>
        </Animated.View>
        
        {contributors.length > 0 && (
          <Animated.View 
            style={[
              styles.contributorsSection,
              {
                opacity: fadeAnim,
                transform: [{ 
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  }) 
                }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Top Contributors</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contributorsContainer}
            >
              {contributors.map((contributor) => (
                <TouchableOpacity 
                  key={contributor.id}
                  style={styles.contributorItem}
                  onPress={() => Linking.openURL(contributor.html_url)}
                >
                  <Image 
                    source={{ uri: contributor.avatar_url }} 
                    style={styles.contributorAvatar} 
                  />
                  <Text style={styles.contributorName}>{contributor.login}</Text>
                  <View style={styles.contributionCount}>
                    <Text style={styles.contributionText}>
                      {contributor.contributions}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
        
        <Animated.View 
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) 
              }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openInBrowser}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>Open in Browser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: isFavorite ? '#e74c3c' : '#2ecc71' }
            ]}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart-dislike" : "heart"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionText}>
              {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.readmeSection,
            {
              opacity: fadeAnim,
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) 
              }]
            }
          ]}
        >
          <View style={styles.readmeHeader}>
            <Text style={styles.sectionTitle}>README</Text>
            <TouchableOpacity 
              style={styles.expandButtonContainer}
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.expandButton}>
                {expanded ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#2ecc71" style={styles.loader} />
          ) : (
            <View style={[
              styles.readmeContent, 
              !expanded && styles.readmeCollapsed,
              !expanded && {
                position: 'relative'
              }
            ]}>
              {readmeContent ? (
                <>
                  <RenderHTML 
                    source={{ html: readmeContent }} 
                    contentWidth={width - 60}
                    baseStyle={baseStyle}
                    tagsStyles={tagsStyles}
                    renderersProps={renderersProps}
                    customHTMLElementModels={customHTMLElementModels}
                    ignoredDomTags={['path', 'circle', 'rect', 'polygon']} 
                    enableExperimentalBRCollapsing
                    enableExperimentalMarginCollapsing
                    defaultViewProps={{ style: { paddingBottom: 16 } }}
                  />
                  {!expanded && (
                    <View style={styles.readmeGradient} />
                  )}
                </>
              ) : (
                <View style={styles.noReadmeContainer}>
                  <Ionicons name="document-text-outline" size={40} color="#bdc3c7" />
                  <Text style={styles.noReadmeText}>No README available for this repository.</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#1a1e22',
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ownerInfo: {
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  ownerLink: {
    fontSize: 14,
    color: '#5ac8fa',
    marginTop: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  repoName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  favoriteButtonActive: {
    backgroundColor: '#e74c3c',
  },
  description: {
    fontSize: 16,
    color: '#bdc3c7',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -42,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#ecf0f1',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34495e',
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  contributorsSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginLeft: 25
  },
  contributorsContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 14,
  },
  contributorItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  contributorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
  contributorName: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  contributionCount: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
  },
  contributionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flex: 0.48,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  readmeSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  readmeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  expandButtonContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expandButton: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
  },
  readmeContent: {
    paddingHorizontal: 10,
  },
  readmeCollapsed: {
    maxHeight: 300,
    overflow: 'hidden',
  },
  readmeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundGradient: {
      colors: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 }
    },
    // Using backgroundColor with opacity as a fallback for gradient
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  noReadmeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noReadmeText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 16,
  },
  loader: {
    marginVertical: 30,
  },
  shareButton: {
    marginRight: 16,
  },
});

export default DetailsScreen;