import { z } from "zod";

//AUTH
export const formSignUp = z.object({
  email: z.string().min(2, "Email field is required.").default(""),
  password: z.string().min(2, "Password field is required.").default(""),
  confirmPassword: z.string().min(2, "Comfirm password field is required.").default("").optional(),
  username: z.string().min(2, "Username field is required.").default(""),
  country: z.string({
    required_error: "Please select a country.",
  }),
  first_name: z.string().min(2, "First name field is required.").default(""),
  last_name: z.string().min(2, "Last name field is required.").default(""),
  gender: z.string().min(2, "Gender field is required.").default(""),
  accountType: z.string().min(2, "Account type field is required.").default("Individual").optional(),
  categoryId: z.string().min(1, "Category field is required.").default("1").optional(),
});

export const formResetPassword = z.object({
  token: z.string().min(2, "Verification code field is required.").default(""),
  password: z.string().min(2, "Password field is required.").default(""),
  confirmPassword: z.string().min(2, "Comfirm password field is required.").default(""),
});

export const formSignUpVerification = z.object({
  verification_code: z.string().min(4, {
    message: "Your one-time password must be 4 characters.",
  }),
});

export const formLoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const formNewQuestionaire = z.object({
  label: z.string().min(1, { message: "Question label is required" }),
  fieldType: z.string().min(1, { message: "Question type is required" }),
  options: z.array(z.string()).default([]),
  required: z.boolean().optional(),
});

export const formSchemaService = z.object({
  tagline: z.string().min(2, "Title field is required.").default(""),
  description: z.string().min(2, "Description field is required.").default(""),
  serviceCategoryId: z.string().min(1, "Category field is required.").default(""),
  serviceTypeId: z.string().min(1, "Type field is required.").default(""),
  shopId: z.string().min(1, "shopId field is required.").default(""),

  basicPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.")
    .default("0")
    .optional(),
  basicName: z.string().min(2, "Name field is required").default(""),
  basicDescription: z.string().min(5, "Description field is required").default(""),
  basicItems: z.array(z.string()).default([]), // Updated to array

  standardName: z.string().default("Standard"),
  standardPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.")
    .default("0")
    .optional(),
  standardDescription: z.string().optional(),
  Items: z.array(z.string()).default([]), // Updated to array

  premiumName: z.string().default("Premium"),
  premiumPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.")
    .default("0")
    .optional(),
  premiumDescription: z.string().optional(),
  premiumItems: z.array(z.string()).default([]), // Updated to array

  tags: z.array(z.string()).optional(),
});

export const formSchemaShop = z.object({
  username: z.string().min(2, "Username field is required."),
  description: z.string().min(2, "Description field is required.").max(150, "Description is more than 150."),
  name: z.string().min(2, "Shop name field is required."),
});

export const formSchemaReview = z.object({
  comment: z.string().min(1, "Review comment is required"),
  rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
});

export const formSchemaInvite = z.object({
  userId: z.number().min(10, "Select a user"),
});

export const formSchemaComment = z.object({
  comment: z.string().min(1, "Comment is required"),
});

export const formSchemaPayout = z.object({
  accountName: z.string().optional(),
  payoutAccountNumber: z.string().min(2, "Account number field is required.").default(""),
  payoutBankName: z.string().min(2, "Bank name field is required.").default(""),
});

export const formSchemaPayment = z.object({
  accountName: z.string().optional(),
  accountNumber: z.string().min(2, "Account number is required.").default(""),
  bankName: z.string().min(2, "Bank name is required.").default(""),
  country: z.string().min(1, "Country is required.").default(""),
});

export const formSchemaVerification = z.object({
  acountType: z.string().default("Individual"),
  nationality: z.string().default("Nigeria"),
  firstName: z.string().min(2, "First name field is required.").default(""),
  lastName: z.string().min(2, "Last name field is required.").default(""),
  contactAddress: z.string().min(2, "Contact address field is required.").default(""),
  refereeName: z.string().default(""),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  refereePhoneNumber: z.string().default(""),
});

export const formSchemaLaunch = z.object({
  terms: z
    .boolean()
    .refine((value) => value === true, {
      message: "Please accept the terms of use.",
    })
    .default(false),
  sellerPolicies: z
    .boolean()
    .refine((value) => value === true, {
      message: "Please accept the seller policies.",
    })
    .default(false),
  intellectualPolicies: z
    .boolean()
    .refine((value) => value === true, {
      message: "Please accept the intellectual property policies.",
    })
    .default(false),
});

// EVENTS FORM
export const formSchemaEvents = z.object({
  title: z.string().min(2, "Title field is required."),
  description: z.string().min(2, "Descrition field is required."),
  organizer: z.string().min(2, "Organizer field is required."),
  eventCategory: z.string().min(1, "Category field is required."),
  event_types: z.string().min(1, "Type field is required."),
  event_ticketing: z.string().default("Paid").optional(),
  isSprayingEnabled: z.boolean().optional(),
  capacity: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.")
    .min(1, "Capacity field is required."),
  vendors: z.array(z.string()).optional(),
  privacy: z.enum(["Public", "Private"]).default("Public"),
});

export const formSchemaTimeLocation = z.object({
  date: z.date({
    required_error: "Start date/time is required.",
    invalid_type_error: "Please enter a valid start date and time",
  }),
  endTime: z.date({
    required_error: "End date/time is required.",
    invalid_type_error: "Please enter a valid end date and time",
  }),
  frequency: z.string().default("NEVER").optional(),
  externalLink: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

export const searchSchema = z.object({
  country: z.string().optional(),
  state: z.string().optional(),
  eventTicketing: z.string().optional(),
  category: z.string().optional(),
});

export const marketPlaceSchema = z.object({
  serviceType: z.string().optional(),
  country: z.string().optional(),
  minRating: z.string().optional(),
  minCompletionPercentage: z.string().optional(),
  vendorTier: z.array(z.string()).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
});

export const eventFormSchema = z.object({
  title: z.string().min(2, "Title field is required."),
  description: z.string().min(2, "Descrition field is required."),
  event_types: z.number().optional(),
  event_ticketing: z.string().min(1, "Ticket field is required."),
  date: z.date({
    required_error: "Date/time is required.",
  }),
  endTime: z.date({
    required_error: "Time is required.",
  }),
  regularPrice: z.number().optional(),
  vipPrice: z.number().optional(),
  UserId: z.number().optional(),
  capacity: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  externalLink: z.string().optional(),
  executivePrice: z.number().optional(),
  address: z.string().min(1, "Address field is required."),
});

export const formSchemaContact = z.object({
  firstname: z.string().min(2, "First name field is required.").default(""),
  lastname: z.string().min(2, "Last name field is required.").default(""),
  email: z.string().min(2, "Email field is required.").default(""),
  country: z.string().default("US"),
  phone: z.string().min(2, "Phone number field is required.").default(""),
});

export const formOrderTicket = z.object({
  form_response: z
    .array(
      z
        .object({
          label: z.string().optional(),
          fieldType: z.string().optional(),
          response: z.union([z.string().optional(), z.array(z.string()).optional()]),
        })
        .optional()
    )
    .optional(),
  ticketDetails: z.record(
    z.array(
      z.object({
        fullName: z.string().min(2, "Full name field is required."),
        phoneNumber: z.string().min(2, "Phone number field is required."),
        email: z.string().email("Email field is required."),
      })
    )
  ),
  quantity: z.string().optional(),
  eventPlanId: z.string().optional(),
  itemType: z.string().optional(),
  currency: z.string().optional(),
  eventId: z.string().optional(),
  vendorId: z.string().optional(),
  userId: z.string().optional(),
  discountCode: z.string().optional(),
});

export const formSchemaDeliveryDetails = z.object({
  fullname: z.string().min(2, "Full name field is required.").default(""),
  phone: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Only numbers are allowed.")
    .min(2, "Phone number field is required.")
    .default(""),
  email: z.string().min(2, "Email field is required.").default(""),
  country: z.string().default("NGN"),
  location: z.string().default("").optional(),
  city: z.string().default("").optional(),
  promo_code: z.string().default("").optional(),

  orderTypeId: z.number().optional(),
  orderType: z.string().optional(),
  quantity: z.number().optional(),
  vendorId: z.number().optional(),

  billAddress: z.string().min(2, "ZIP Code field is required.").default(""),
  shippingAddress: z.string().min(2, "Address field is required.").default(""),
  description: z.string().min(2, "Description field is required.").default(""),
});

export const formSchemaTables = z.object({
  NumOfTables: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Table number must be a valid number.")
    .min(1, "Table number field is required."),
  NumOfGuests: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Guest number must be a valid number.")
    .min(1, "Guest number field is required."),
});

export const formSpray = z.object({
  // currency: z.string().min(1, "Currency field is required."),
  sprayAmount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Spray amount must be a valid number.")
    .min(1, "Spray amount field is required."),
});

export const formAiEvents = z.object({
  title: z.string().min(4, "Title field is required.").default(""),
  event_category: z.string().min(2, "Event category field is required.").default(""),
  budget: z.string().min(2, "Budget field is required.").default(""),
  duration: z.string().min(1, "Duration field is required.").default(""),
  event_type: z.string().min(2, "Event type field is required.").default(""),
  number_of_guests: z.string().min(2, "Number of guests field is required.").default(""),
  Date_and_Time: z.date().optional(),
  number_of_aays: z.number().optional(),
  state: z.string().min(1, "State field is required.").default(""),
  town: z.string().min(1, "Town field is required.").default(""),
  event_owner: z.string().min(1, "Event owner field is required.").default(""),
  country: z.string().optional(),
  current_date: z.date().optional(),
  Plan_Details: z.string().min(1, "Plan Details field is required.").default(""),
});

export const formSchemaEditTables = z.object({
  price: z.string().min(2, "Price field is required").default(""),
});
export const formInviteEmail = z.object({
  invitations: z
    .array(
      z.object({
        fullName: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
      })
    )
    .min(1),
  message: z.string().min(2, "Message field is required"),
});

export const formGuest = z.object({
  name: z.string().min(1, "Select a guest").default(""),
});

export const formAddTables = z.object({
  numOfSeats: z.string().min(1, "Enter number of seats").default(""),
  position: z.string().min(1, "Select table position").default(""),
  Category: z.string().min(1, "Select category").default(""),
  label: z.string().min(1, "Enter table name").default(""),
});

// SUPORT DATA
export const formSchemaSupport = z.object({
  subject: z.string().min(1, "Subject field is required.").default(""),
  categoryId: z.string().min(1, "Category field is required.").default(""),
  description: z.string().min(1, "Description field is required.").default(""),
});

export const ticketValidationSchema = z.object({
  ticketRef: z.string().min(2, "Ticket number is required.").default(""),
  EventId: z.number().min(1, "Event is required.").default(0),
});

//  WALLET
export const requestPayoutSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a valid number.")
    .min(1, "Amount field is required."),
});

export const profileSchema = z.object({
  first_name: z.string().min(2, { message: "Firstname is required" }),
  last_name: z.string().min(2, { message: "Lastname is required" }),
  email: z.string().min(2, { message: "Email is required" }),
  gender: z.string().default("").optional(),
  country: z.string().default("").optional(),
  state: z.string().default("").optional(),
  phone: z.string().default("").optional(),
  bio: z.string().default("").optional(),
});

export const storeSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  accountType: z.string().min(2, "Account type field is required.").default("Individual").optional(),
  categoryId: z.string().min(1, "Category field is required.").default("1").optional(),
  gender: z.string().default("").optional(),
  country: z.string().default("").optional(),
  state: z.string().default("").optional(),
  phone: z.string().default("").optional(),
  bio: z.string().default("").optional(),
});

export const formSchemaPreference = z.object({
  language: z.string().optional(),
  preferredCurrency: z.string().min(1, "Currency field is required."),
});

export const formJoinSprayRoom = z.object({
  name: z.string().default("").optional(),
  description: z.string().default("").optional(),
  recipient: z.string().default("").optional(),
});
