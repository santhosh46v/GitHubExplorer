# GitHub Explorer

A modern React Native mobile application built with Expo for exploring GitHub repositories. Search, discover, and save your favorite repositories with a beautiful and intuitive interface.

## Features

### 🔍 Search & Discover
- **Search Repositories**: Search GitHub repositories by name, description, or keywords
- **Sort by Stars**: Results are automatically sorted by star count (descending)
- **Pull to Refresh**: Refresh search results with a simple pull gesture

### 📱 Repository Details
- **Comprehensive Information**: View detailed repository information including repository name, owner, description, star count, forks, watchers, programming language, dates, license, and default branch
- **README Display**: View formatted README content directly in the app
- **Top Contributors**: See the top 5 contributors to each repository
- **Share Functionality**: Share repositories with others

### ⭐ Favorites Management
- **Save Favorites**: Mark repositories as favorites for quick access
- **Favorites Screen**: Dedicated screen to view all your favorite repositories
- **Remove Favorites**: Easily remove repositories from your favorites list

### 🎨 User Interface
- **Modern Design**: Clean, modern UI with smooth animations
- **Animated Headers**: Dynamic header animations that respond to scrolling
- **Language Color Indicators**: Visual color coding for programming languages

## Tech Stack

- **React Native** (0.76.7)
- **Expo** (~52.0.41)
- **React** (18.3.1)
- **Redux** - State management for favorites
- **React Navigation** - Navigation between screens
- **Axios** - HTTP client for GitHub API
- **React Native Render HTML** - Rendering README content
- **Expo Vector Icons** - Icon library

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GitHubExplorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional required packages**
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npm install react-native-screens react-native-safe-area-context
   npm install axios react-native-render-html @expo/vector-icons
   ```

4. **Start the Expo development server**
   ```bash
   npm start
   ```

## Usage

### Running the App

- **Start Expo**: `npm start`
- **Run on Android**: `npm run android`
- **Run on iOS**: `npm run ios`
- **Run on Web**: `npm run web`

### Using the App

1. **Search Repositories**: Enter a search query in the search bar and tap the search button
2. **View Repository Details**: Tap on any repository card to view details, README content, and statistics
3. **Manage Favorites**: Tap the heart icon to add favorites, navigate to Favorites tab to view saved repositories

## API Usage

This app uses the [GitHub REST API](https://docs.github.com/en/rest) to fetch repository data:

- **Search Repositories**: `GET /search/repositories`
- **Repository README**: `GET /repos/{owner}/{repo}/readme`
- **Repository Contributors**: `GET /repos/{owner}/{repo}/contributors`

No authentication is required for public repositories.

## Features in Detail

### Home Screen
- Animated header that shrinks on scroll
- Search input with real-time search capability
- Repository cards displaying owner avatar, repository name, description, star count, fork count, and language
- Empty state with helpful message
- Loading indicators and error handling

### Details Screen
- Animated header with repository information
- Statistics display (stars, forks, watchers)
- Repository metadata (language, dates, license, branch)
- Top contributors carousel
- Formatted README content with HTML rendering
- Action buttons (Open in Browser, Add/Remove Favorite)

### Favorites Screen
- List of all favorited repositories
- Empty state with call-to-action
- Quick navigation to repository details
- Remove favorites functionality

## State Management

The app uses Redux for managing favorites with actions `ADD_TO_FAVORITES` and `REMOVE_FROM_FAVORITES`.

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- Expo Go app on your mobile device (for testing)

### Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
