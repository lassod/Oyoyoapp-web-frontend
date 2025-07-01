export type verificationProps = {
  notVerified: boolean;
  email: string;
  onVerificationComplete: () => void;
};

export type Payment = {
  name: string;
  id: string;
  price: number;
  package: "Vanilla cake" | "Cake" | "Cupcake";
  description: string;
  category: "Basic" | "Standard" | "Premium";
  order: number;
  sale: number;
  tags: string[];
  date: string;
  status: "Active" | "Inactive";
};

export type Orders = {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: false;
  userId: number;
  vendorId: number;
  orderStatus: string;
  quantity: number;
  totalAmount: number;
  billAddress: string;
  shippingAddress: string;
  orderReceipt?: null;
  orderType: string;
  orderTypeId: 2;
  discountId?: null;
  description?: null;
  OrderItems?: [];
  transactionRef?: [];
  vendor: {
    avatar: string;
    User: any;
    id: number;
    first_name: string;
    email: "drex5972@gmail.com";
    last_name: "Doe";
    gender?: null;
  };
  user: {
    avatar: string;
    id: number;
    first_name: string;
    email: string;
    last_name: string;
    gender: string;
  };
};

export type Support = {
  id: string;
  subject: string;
  category: string;
  date: string;
  status: "Open" | "Resolved";
};

export type Package = {
  packageName: string;
  change: string;
  price: string;
  sold: string;
  sales: string;
};

export type Wallet = {
  symbol: string;
  vendor: any;
  user: any;
  amount: number;
  payoutBankName: string;
  wallet: any;
  id: number;
  orderTypeId: number;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  amountPaid: number;
  settlementAmount: number;
  orderId: number;
  isTicket: true;
  userId: number;
  recieverId: number;
  purpose: string;
  status: string;
  paymentMethod: string;
  transactionType: string;
  description: string;
  vendorId: number;
  commission: number;
  reference: string;
};

export type SignInHistory = {
  id: string;
  userAgent: string;
  ip: string;
  location: string;
};

export interface StepsProp {
  data: {
    step: string;
    title: string;
    text: string;
  };
}
export interface ErrorProp {
  response: {
    data: {
      errors: [
        {
          message: string;
        }
      ];
    };
  };
}

export interface UserProp {
  orderStatus: string;
  vendor: any;
  User: any;
  description: string;
  quantity: number;
  totalAmount: number;
  orderTypeId?: number;
  orderType?: string;
  id: number;
  username: string;
  bio: string;
  avatar: string;
  preferredCurrency: string;
  currencySymbol: string;
  phone: number;
  email: string;
  first_name: string;
  last_name: string;
  isVendor: boolean;
  hasPlan: boolean;
  gender: string;
  country: string;
  state: string;
  role: string;
  paymentGatewayId: string;
  Wallet: {
    id: string;
    walletBalance: number;
    currency: string;
    symbol: string;
    userId: number;
  };
  _count: { followers: number; following: number };
}

export const defaultUser: UserProp = {
  id: 0,
  email: "",
  username: "",
  bio: "",
  avatar: "",
  preferredCurrency: "",
  currencySymbol: "",
  phone: 0,
  first_name: "",
  last_name: "",
  isVendor: false,
  hasPlan: false,
  gender: "",
  country: "",
  state: "",
  role: "",
  paymentGatewayId: "",
  Wallet: {
    id: "",
    walletBalance: 0,
    currency: "",
    symbol: "",
    userId: 0,
  },
  _count: {
    followers: 0,
    following: 0,
  },
  orderStatus: "",
  vendor: {},
  User: {},
  description: "",
  quantity: 0,
  totalAmount: 0,
};
