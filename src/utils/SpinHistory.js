/**
 * SpinHistory - Tracks and persists spin results
 */

export class SpinHistory {
  constructor(maxHistory = 10) {
    this.maxHistory = maxHistory;
    this.history = this.loadHistory();
  }

  /**
   * Add a spin result to history
   * @param {Object} result - Spin result with label, color, index
   */
  addSpin(result) {
    const entry = {
      label: result.label,
      color: result.color,
      index: result.index,
      timestamp: Date.now(),
    };

    this.history.unshift(entry); // Add to beginning

    // Keep only last N spins
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }

    this.saveHistory();
  }

  /**
   * Get all history
   * @returns {Array} Array of spin results
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get statistics about spins
   * @returns {Object} Statistics object
   */
  getStatistics() {
    if (this.history.length === 0) {
      return {
        totalSpins: 0,
        segmentCounts: {},
        mostCommon: null,
        leastCommon: null,
      };
    }

    // Count occurrences of each segment
    const counts = {};
    for (const entry of this.history) {
      counts[entry.label] = (counts[entry.label] || 0) + 1;
    }

    // Find most and least common
    let mostCommon = null;
    let leastCommon = null;
    let maxCount = 0;
    let minCount = Number.POSITIVE_INFINITY;

    for (const [label, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = { label, count };
      }
      if (count < minCount) {
        minCount = count;
        leastCommon = { label, count };
      }
    }

    return {
      totalSpins: this.history.length,
      segmentCounts: counts,
      mostCommon,
      leastCommon,
    };
  }

  /**
   * Clear all history
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Load history from localStorage
   * @private
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem('spinHistory');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load spin history:', error);
      return [];
    }
  }

  /**
   * Save history to localStorage
   * @private
   */
  saveHistory() {
    try {
      localStorage.setItem('spinHistory', JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save spin history:', error);
    }
  }

  /**
   * Export history as JSON
   * @returns {string} JSON string of history
   */
  exportJSON() {
    return JSON.stringify(this.history, null, 2);
  }
}
