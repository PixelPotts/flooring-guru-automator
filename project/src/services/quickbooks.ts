import IntuitOAuth from 'intuit-oauth';
import QuickBooks from 'node-quickbooks';

interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  redirectUri: string;
  token?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

class QuickBooksService {
  private oauth: typeof IntuitOAuth;
  private qbo: typeof QuickBooks | null = null;
  private config: QuickBooksConfig;

  constructor(config: QuickBooksConfig) {
    this.config = config;
    this.oauth = new IntuitOAuth({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      environment: config.environment,
      redirectUri: config.redirectUri
    });

    if (config.token) {
      this.initializeQBO(config.token);
    }
  }

  private initializeQBO(token: QuickBooksConfig['token']) {
    if (!token) return;

    this.qbo = new QuickBooks(
      this.config.clientId,
      this.config.clientSecret,
      token.access_token,
      false, // no token secret for oAuth 2.0
      this.config.environment === 'production' ? '' : 'sandbox-',
      true, // debug
      null, // minor version
      '2.0', // oauth version
      token.refresh_token
    );
  }

  public getAuthorizationUrl() {
    return this.oauth.authorizeUri({
      scope: [IntuitOAuth.scopes.Accounting],
      state: 'randomState'
    });
  }

  public async handleCallback(url: string) {
    const parseRedirect = await this.oauth.createToken(url);
    const token = parseRedirect.getJson();
    this.initializeQBO(token);
    return token;
  }

  public async syncInvoices(invoices: any[]) {
    if (!this.qbo) throw new Error('QuickBooks not initialized');

    const results = [];
    for (const invoice of invoices) {
      try {
        const qbInvoice = await this.createInvoice(invoice);
        results.push(qbInvoice);
      } catch (error) {
        console.error('Error syncing invoice:', error);
        throw error;
      }
    }
    return results;
  }

  private async createInvoice(invoice: any) {
    return new Promise((resolve, reject) => {
      if (!this.qbo) {
        reject(new Error('QuickBooks not initialized'));
        return;
      }

      this.qbo.createInvoice({
        Line: invoice.items.map((item: any) => ({
          Amount: item.total,
          Description: item.description,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: {
              value: '1',
              name: item.type === 'material' ? 'Materials' : 'Labor'
            },
            UnitPrice: item.unitPrice,
            Qty: item.quantity
          }
        })),
        CustomerRef: {
          value: invoice.clientId
        }
      }, (err: any, invoice: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(invoice);
        }
      });
    });
  }

  public async syncCustomers(customers: any[]) {
    if (!this.qbo) throw new Error('QuickBooks not initialized');

    const results = [];
    for (const customer of customers) {
      try {
        const qbCustomer = await this.createCustomer(customer);
        results.push(qbCustomer);
      } catch (error) {
        console.error('Error syncing customer:', error);
        throw error;
      }
    }
    return results;
  }

  private async createCustomer(customer: any) {
    return new Promise((resolve, reject) => {
      if (!this.qbo) {
        reject(new Error('QuickBooks not initialized'));
        return;
      }

      this.qbo.createCustomer({
        DisplayName: customer.name,
        CompanyName: customer.company,
        PrimaryEmailAddr: {
          Address: customer.email
        },
        PrimaryPhone: {
          FreeFormNumber: customer.phone
        },
        BillAddr: {
          Line1: customer.address
        }
      }, (err: any, customer: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(customer);
        }
      });
    });
  }
}

export default QuickBooksService;