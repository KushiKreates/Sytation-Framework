type StorageType = 'localStorage' | 'sessionStorage';
type DataValue = string | number | boolean | object | null;
type SetOptions = 'Create' | undefined;
type EncryptionOptions = {
  isEncrypted: boolean;
  key?: string;
};

class QuickDB {
  private static instances: Map<string, QuickDB> = new Map();
  private storage: Storage;
  private isEncrypted: boolean;
  private encryptionKey: string;
  private instanceName: string;
  
  constructor(
    storageType: StorageType = 'localStorage',
    instanceName: string,
    options: EncryptionOptions = { isEncrypted: false }
  ) {
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    this.instanceName = instanceName;
    this.isEncrypted = options.isEncrypted;
    
    const storedKey = this.storage.getItem(`__quickdb_peer_${instanceName}`);
    this.encryptionKey = options.key || storedKey || this.generateEncryptionKey();
    
    if (this.isEncrypted && !storedKey) {
      this.storage.setItem(`__quickdb_peer_${instanceName}`, this.encryptionKey);
      console.info('%c QuickDB Encryption ', 
        'background: #4CAF50; color: white; font-weight: bold;',
        `\nEncryption enabled for ${instanceName}`
      );
    }
  }

  private generateEncryptionKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private encrypt(data: string): string {
    if (!this.isEncrypted) return data;
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const encoded = textEncoder.encode(data);
    const keyBytes = textEncoder.encode(this.encryptionKey);
    
    const encrypted = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
      encrypted[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return textDecoder.decode(encrypted);
  }

  private decrypt(data: string): string {
    return this.encrypt(data);
  }

  private async showModal(name: string) {
    const { showModal } = await import('@/lib/quickDB/modal');
    return showModal({
      title: `Delete Instance "${name}"`,
      message: `Are you sure you want to delete this instance(${name}) and all its data?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmType: "delete"
    });
  }



  static getInstance(name: string = 'Global'): QuickDB | undefined {
    return QuickDB.instances.get(name);
  }

  static createInstance(
    name: string, 
    isEncrypted = false, 
    key?: string
  ): QuickDB {
    const instance = new QuickDB('localStorage', name, { isEncrypted, key });
    QuickDB.instances.set(name, instance);
    return instance;
  }

  set(key: string, value: DataValue, option?: SetOptions): void {
    const serializedValue = JSON.stringify(value);
    const securedValue = this.encrypt(serializedValue);
    this.storage.setItem(key, securedValue);
  }

  get(key: string): any {
    const item = this.storage.getItem(key);
    if (!item) return null;
    const decryptedValue = this.decrypt(item);
    return JSON.parse(decryptedValue);
  }

  query(key: string): any {
    return this.get(key);
  }

async delete(force: boolean = false): Promise<boolean> {
    if (!force) {
        const confirmed = await this.showModal(this.instanceName);
        if (!confirmed) return false;
    }

    const keys = this.getAllKeys();
    keys.forEach(key => this.storage.removeItem(key));
    
    if (this.isEncrypted) {
        this.storage.removeItem(`__quickdb_peer_${this.instanceName}`);
    }

    const DeleteInsta = this.instanceName

    this.log(`Instance "${DeleteInsta}" has been deleted`, 'info');

    QuickDB.instances.delete(this.instanceName);
    

    console.info('%c QuickDB Instance Deleted ', 
        'background: #ef4444; color: white; font-weight: bold;',
        `\nInstance "${this.instanceName}" has been deleted`
    );

    return true;
}

  deleteKey(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  getAllKeys(): string[] {
    return Object.keys(this.storage);
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  dump(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys().filter(key => !key.startsWith('__quickdb_peer_'));
    
    for (const key of keys) {
      data[key] = this.get(key);
    }
    
    console.info('%c QuickDB Dump ', 
      'background: #2196F3; color: white; font-weight: bold;',
      `\nInstance: ${this.instanceName}`,
      '\nData:', data
    );
    
    return data;
  }

  /* Logging system that writes to => Sessionstorage
  /* Logs will disappear after the session ends
  /* Useful for debugging purposes whe using the database

  */

  /**
 
 * @param message The message to log
 * @param level Log level: 'info', 'warn', or 'error'
 */
log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    try {
      // Get existing logs or create new log array
      const logsKey = `__quickdb_logs`;
      const existingLogs = sessionStorage.getItem(logsKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Create log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        instance: this.instanceName,
        message
      };
      
      // Add new log entry
      logs.push(logEntry);
      
      // Store updated logs (keep last 1000 entries max)
      const trimmedLogs = logs.slice(-1000);
      sessionStorage.setItem(logsKey, JSON.stringify(trimmedLogs));
      
      // Also log to console with appropriate styling
      const styles = {
        info: 'background: #3b82f6; color: white; font-weight: bold;',
        warn: 'background: #f59e0b; color: white; font-weight: bold;',
        error: 'background: #ef4444; color: white; font-weight: bold;'
      };
      
      console[level](`%c QuickDB ${level.toUpperCase()} `, 
        styles[level],
        `\n[${this.instanceName}]: ${message}`
      );
    } catch (err) {
      // Fallback to console if anything fails
      console.error('QuickDB logging failed:', err);
    }
  }
  
  /**
   * Get all logs from session storage
   * @returns Array of log entries
   */
  static getLogs(): Array<{timestamp: string, level: string, instance: string, message: string}> {
    try {
      const logsKey = `__quickdb_logs`;
      const existingLogs = sessionStorage.getItem(logsKey);
      return existingLogs ? JSON.parse(existingLogs) : [];
    } catch (err) {
      console.error('QuickDB: Failed to retrieve logs', err);
      return [];
    }
  }
  
  /**
   * Clear all logs from session storage
   */
  static clearLogs(): void {
    try {
      sessionStorage.removeItem(`__quickdb_logs`);
      console.info('%c QuickDB Logs ', 
        'background: #4CAF50; color: white; font-weight: bold;',
        '\nAll logs cleared'
      );
    } catch (err) {
      console.error('QuickDB: Failed to clear logs', err);
    }
  }




  static Global = QuickDB.createInstance('Global');
  static User = QuickDB.createInstance('User', true);
}



export default QuickDB;