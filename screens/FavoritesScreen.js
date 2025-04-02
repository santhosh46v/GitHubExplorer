import React, { useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Animated,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { removeFromFavorites } from "../redux/actions";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const FavoritesScreen = () => {
  // Redux
  const favorites = useSelector((state) => state.favorites);
  const loading = useSelector((state) => state.favorites.loading);
  const dispatch = useDispatch();

  // Navigation
  const navigation = useNavigation();

  // Animation
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const handleRemoveFavorite = useCallback(
    (id) => {
      dispatch(removeFromFavorites(id));
    },
    [dispatch]
  );

  const handleRefresh = useCallback(() => {}, []);

  const navigateToDetails = useCallback(
    (repo) => {
      navigation.navigate("DetailsScreen", { repo });
    },
    [navigation]
  );

  const EmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Repositories you mark as favorites will appear here
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Search")}
        >
          <Text style={styles.exploreButtonText}>Explore Repositories</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={[
          styles.repoCard,
          {
            opacity: 1,
            transform: [
              {
                scale: 1,
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          activeOpacity={0.7}
          onPress={() => navigateToDetails(item)}
        >
          <View style={styles.repoHeader}>
            {item.owner?.avatar_url && (
              <Image
                source={{ uri: item.owner.avatar_url }}
                style={styles.ownerAvatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.repoInfo}>
              <Text style={styles.repoName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.ownerName} numberOfLines={1}>
                {item.owner?.login ? `@${item.owner.login}` : "Unknown Owner"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleRemoveFavorite(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="star" size={24} color="#f1c40f" />
            </TouchableOpacity>
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
                {formatCount(item.stargazers_count || 0)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="git-branch" size={16} color="#7f8c8d" />
              <Text style={styles.statText}>
                {formatCount(item.forks_count || 0)}
              </Text>
            </View>

            {item.language && (
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.languageIndicator,
                    { backgroundColor: getLanguageColor(item.language) },
                  ]}
                />
                <Text style={styles.statText}>{item.language}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [navigateToDetails, handleRemoveFavorite]
  );

  // Utility functions
  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}m`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      Python: "#3572A5",
      Java: "#b07219",
      "C++": "#f34b7d",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Ruby: "#701516",
      Go: "#00ADD8",
      Rust: "#dea584",
    };

    return colors[language] || "#8e44ad";
  };

  const favoritesList = Array.isArray(favorites) ? favorites : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f6fa" />

      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Favorites</Text>
            <View style={styles.headerAccent}></View>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerSubtitle}>
              {favoritesList.length}{" "}
              {favoritesList.length === 1 ? "Repo" : "Repos"}
            </Text>
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={favoritesList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          favoritesList.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={["#2ecc71"]}
            tintColor="#2ecc71"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
      />

      {loading && favoritesList.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4E4E4",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    position: "relative",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2c3e50",
    letterSpacing: 0.5,
  },
  headerAccent: {
    position: "absolute",
    bottom: -4,
    left: 0,
    width: 32,
    height: 4,
    backgroundColor: "#2ecc71",
    borderRadius: 2,
  },
  headerBadge: {
    backgroundColor: "#e7f5ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c2e3ff",
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3498db",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  repoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    width: width - 32,
    alignSelf: "center",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#2ecc71",
    transform: [{ scale: 1 }],
  },
  cardContent: {
    padding: 16,
  },
  repoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  repoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  repoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  ownerName: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: "#34495e",
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#7f8c8d",
  },
  languageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 32,
  },
  exploreButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  exploreButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});

export default FavoritesScreen;
