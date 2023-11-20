// deltaProcessor.js

// Delta class to represent a delta entry
class Delta {
    constructor(type, data) {
      this.type = type; 
      this.data = data;
    }
  }
  
  // DeltaProcessor class to handle processing of deltas
  class DeltaProcessor {
    constructor(financialGridSnapshot) {
      this.financialGridSnapshot = financialGridSnapshot;
      this.deltas = []; // Array of Delta objects
    }
  
    // Fetch and process deltas from Deltas.csv
    fetchAndProcessDeltas() {
      const url = './data/Deltas.csv';
      fetch(url)
        .then(response => response.text())
        .then(csvData => {
          this.parseDeltas(csvData);
          this.processDeltas();
        })
        .catch(error => {
          console.error('Error fetching deltas:', error);
        });
    }
  
    // Parse CSV data into Delta objects
    parseDeltas(csvData) {
      const rows = csvData.split('\n').slice(1); // Skip header row
      this.deltas = rows.map(row => {
        const [dataString] = row.split(',');
        if (Number.isInteger(dataString)) {
          return new Delta('delay', parseInt(dataString));
        } else {
          return new Delta('data', dataString.split(','));
        }
      });
    }
  
    // Process deltas and update financial data
    processDeltas() {
      const financialData = this.financialGridSnapshot.data;
  
      for (const delta of this.deltas) {
        if (delta.type === 'delay') {
          setTimeout(() => {
            this.processDeltas();
          }, delta.data);
          return;
        } else if (delta.type === 'data') {
          const [name, companyName, price, change, chgPercent, marketCap] = delta.data;
  
          // Find the corresponding financial data object
          const financialDataEntry = financialData.find(item => item.name === name);
  
          // Update the financial data
          if (financialDataEntry) {
            financialDataEntry.price = parseFloat(price);
            financialDataEntry.change = parseFloat(change);
            financialDataEntry.chgPercent = chgPercent;
            financialDataEntry.marketCap = marketCap;
  
            // Highlight the updated row for visual notification
            const updatedRow = document.getElementById(`financialGridSnapshotRow-${financialDataEntry.name}`);
            updatedRow.classList.add('updated');
  
            // Remove the highlighting after a short delay
            setTimeout(() => {
              updatedRow.classList.remove('updated');
            }, 500);
          }
        }
      }
  
      // Update the DOM to reflect the latest financial data
      this.financialGridSnapshot.render();
  
      // Repeat the process of fetching and processing deltas
      this.fetchAndProcessDeltas();
    }
  }
  