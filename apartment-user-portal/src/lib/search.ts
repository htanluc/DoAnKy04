// Hệ thống tìm kiếm local sử dụng Fuse.js
import * as searchFuse from './search-fuse';

// Export trực tiếp từ search-fuse
export const globalSearch = searchFuse.globalSearch;
export const searchByType = searchFuse.searchByType;
export const getSearchSuggestions = searchFuse.getSearchSuggestions;
export const initializeSearchIndexes = searchFuse.initializeSearchIndexes;
export const syncDataToSearch = searchFuse.syncDataToSearch;
export const removeDocumentFromSearch = searchFuse.removeDocumentFromSearch;
export const syncAllDataToSearch = searchFuse.syncAllDataToSearch;
export const syncDataChange = searchFuse.syncDataChange;
export const checkMeilisearchHealth = searchFuse.checkMeilisearchHealth;
export const getIndexStats = searchFuse.getIndexStats;
export const searchClient = searchFuse.searchClient;

// Export constants
export const SEARCH_INDICES = searchFuse.SEARCH_INDICES;

// Export search mode
export const getSearchMode = () => ({
  useMeilisearch: false,
  mode: 'Fuse.js Local Search'
});

// Force refresh search system
export const refreshSearchSystem = async () => {
  try {
    console.log('🔄 Refreshing Fuse.js search system...');
    await searchFuse.initializeSearchIndexes();
    return getSearchMode();
  } catch (error) {
    console.error('❌ Failed to refresh search system:', error);
    return { useMeilisearch: false, mode: 'Fuse.js Local Search' };
  }
};

// Initialize search system on module load
searchFuse.initializeSearchIndexes().then(() => {
  console.log('✅ Fuse.js search system initialized successfully');
}).catch(error => {
  console.log('ℹ️ Fuse.js initialization failed, but will work on first search');
});
