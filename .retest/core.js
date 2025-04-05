/**
 * PostSync Test Suite
 * A comprehensive test script for validating the PostSync library functionality
 * 
 * Run with: node .retest/test.js
 */

const { createApiClient, getEndpoint } = require("../dist/index.js");
const fs = require("fs");
const path = require("path");

// Helper functions
const logger = {
  success: (message) => console.log(`✅ ${message}`),
  error: (message) => console.error(`❌ ${message}`),
  info: (message) => console.log(`ℹ️ ${message}`),
  header: (message) => console.log(`\n🔷 ${message}`),
  warning: (message) => console.log(`⚠️ ${message}`),
  json: (data) => console.log(JSON.stringify(data, null, 2))
};

// Test suite
class PostSyncTest {
  constructor(collectionPath) {
    this.collectionPath = collectionPath;
    this.collection = null;
    this.api = null;
  }

  async runAll() {
    try {
      logger.header("POSTSYNC TEST SUITE");
      
      await this.loadCollection();
      this.validateCollectionStructure();
      await this.createApiClient();
      await this.inspectApiClient();
      await this.testApiEndpoint();
      
      logger.header("ALL TESTS COMPLETED");
    } catch (error) {
      logger.error(`Test suite failed: ${error.message}`);
      console.error(error);
    }
  }

  async loadCollection() {
    logger.header("LOADING COLLECTION");
    try {
      const content = fs.readFileSync(this.collectionPath, "utf8");
      this.collection = JSON.parse(content);
      logger.success(`Loaded Postman collection: ${this.collection.info?.name || 'Unnamed collection'}`);
      logger.info(`Contains ${this.collection.item?.length || 0} resource groups`);
    } catch (error) {
      logger.error(`Failed to load collection: ${error.message}`);
      throw error;
    }
  }

  validateCollectionStructure() {
    logger.header("VALIDATING COLLECTION STRUCTURE");
    
    // Check top-level structure
    if (!this.collection.info || !this.collection.item || !Array.isArray(this.collection.item)) {
      logger.error("Collection is missing required top-level properties");
      throw new Error("Invalid collection structure");
    }
    
    // Track issues
    const issues = [];
    
    // Check each group
    this.collection.item.forEach((group, groupIndex) => {
      if (!group.name) {
        issues.push(`Group at index ${groupIndex} is missing a name`);
      }
      
      if (!group.item || !Array.isArray(group.item)) {
        issues.push(`Group '${group.name || groupIndex}' is missing endpoints array`);
        return;
      }
      
      logger.info(`Checking group: ${group.name} (${group.item.length} endpoints)`);
      
      // Check each endpoint in the group
      group.item.forEach((endpoint, endpointIndex) => {
        const endpointName = endpoint.name || `#${endpointIndex}`;
        
        if (!endpoint.request) {
          issues.push(`Endpoint '${endpointName}' in group '${group.name}' is missing request object`);
          return;
        }
        
        if (!endpoint.request.method) {
          issues.push(`Endpoint '${endpointName}' in group '${group.name}' is missing request method`);
        }
        
        if (!endpoint.request.url) {
          issues.push(`Endpoint '${endpointName}' in group '${group.name}' is missing request URL`);
        }
      });
    });
    
    // Report results
    if (issues.length > 0) {
      logger.warning(`Found ${issues.length} issues in collection structure:`);
      issues.forEach(issue => logger.warning(`- ${issue}`));
    } else {
      logger.success("Collection structure is valid");
    }
  }

  async createApiClient() {
    logger.header("CREATING API CLIENT");
    try {
      this.api = createApiClient(this.collection, {
        baseUrl: "https://fakestoreapi.com",
      });
      logger.success("API client created successfully");
    } catch (error) {
      logger.error(`Failed to create API client: ${error.message}`);
      throw error;
    }
  }

  async inspectApiClient() {
    logger.header("INSPECTING API CLIENT STRUCTURE");
    
    const groups = Object.keys(this.api);
    if (groups.length === 0) {
      logger.warning("API client contains no resource groups");
      return;
    }
    
    logger.success(`API client contains ${groups.length} groups: ${groups.join(", ")}`);
    
    // Inspect first group as a sample
    const firstGroup = groups[0];
    logger.info(`Inspecting first group: '${firstGroup}'`);
    
    const methods = Object.keys(this.api[firstGroup]);
    if (methods.length === 0) {
      logger.warning(`Group '${firstGroup}' contains no HTTP methods`);
      return;
    }
    
    logger.info(`Available HTTP methods: ${methods.join(", ")}`);
    
    // Inspect the first method's endpoints
    const firstMethod = methods[0];
    logger.info(`Inspecting endpoints for method: '${firstMethod}'`);
    
    const endpoints = Object.keys(this.api[firstGroup][firstMethod]);
    if (endpoints.length === 0) {
      logger.warning(`No endpoints found for ${firstGroup}.${firstMethod}`);
      return;
    }
    
    logger.info(`Available endpoints: ${endpoints.join(", ")}`);
    logger.success("API client structure looks valid");
  }

  async testApiEndpoint() {
    logger.header("TESTING API ENDPOINT");
    try {
      // Find the first available endpoint
      const firstGroup = Object.keys(this.api)[0];
      const firstMethod = Object.keys(this.api[firstGroup])[0];
      const firstEndpoint = Object.keys(this.api[firstGroup][firstMethod])[0];
      
      logger.info(`Testing endpoint: ${firstGroup}.${firstMethod}.${firstEndpoint}()`);
      
      const response = await this.api[firstGroup][firstMethod][firstEndpoint]();
      
      if (!response) {
        throw new Error("Endpoint returned no response");
      }
      
      logger.info(`Response status: ${response.status}`);
      
      if (response.data) {
        logger.success("Endpoint returned valid data");
        logger.info(`Data preview: ${typeof response.data === 'object' ? 
          JSON.stringify(response.data).substring(0, 100) + '...' : 
          response.data}`);
      } else {
        logger.warning("Endpoint returned no data in response");
      }
    } catch (error) {
      logger.error(`API endpoint test failed: ${error.message}`);
      console.error(error);
    }
  }
}

// Run the tests
const testRunner = new PostSyncTest(path.join(__dirname, "postman-collection.json"));
testRunner.runAll();