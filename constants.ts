
import { ServiceCategory, ServiceType, Store, MenuItem } from './types';
import { FoodIcon, GroceryIcon, PharmacyIcon, PackageIcon, DocumentIcon, HeavyItemIcon, TruckIcon, BuildingStorefrontIcon } from './components/icons';

export const SERVICE_TYPES: ServiceType[] = [
  {
    category: ServiceCategory.Food,
    description: 'Get your favorite meals delivered fast.',
    icon: FoodIcon,
  },
  {
    category: ServiceCategory.Grocery,
    description: 'Fresh groceries from your local store.',
    icon: GroceryIcon,
  },
  {
    category: ServiceCategory.Pharmacy,
    description: 'Medicine and health supplies to your door.',
    icon: PharmacyIcon,
  },
  {
    category: ServiceCategory.Package,
    description: 'Send and receive parcels with ease.',
    icon: PackageIcon,
  },
  {
    category: ServiceCategory.Document,
    description: 'Urgent documents delivered securely.',
    icon: DocumentIcon,
  },
  {
    category: ServiceCategory.Heavy,
    description: 'For furniture and other bulky items.',
    icon: HeavyItemIcon,
  },
  {
    category: ServiceCategory.Moving,
    description: 'Relocate your home or office with ease.',
    icon: TruckIcon,
  },
  {
    category: ServiceCategory.BusinessLogistics,
    description: 'Professional logistics for your company.',
    icon: BuildingStorefrontIcon,
  },
];

export const MOCK_RESTAURANTS: Store[] = [
    {
        id: 'r1',
        name: 'The Golden Stool',
        cuisine: 'Ghanaian, Continental',
        rating: 4.8,
        imageUrl: 'https://placehold.co/400x300/a43a3a/ffffff?text=Golden+Stool',
        address: '123 Adum Street, Kumasi',
    },
    {
        id: 'r2',
        name: 'Jofong Special',
        cuisine: 'Pizza, Fast Food',
        rating: 4.5,
        imageUrl: 'https://placehold.co/400x300/c89211/ffffff?text=Jofong',
        address: '45 Asafo Road, Kumasi',
    },
    {
        id: 'r3',
        name: 'Noble House',
        cuisine: 'Chinese, Asian',
        rating: 4.7,
        imageUrl: 'https://placehold.co/400x300/3e7646/ffffff?text=Noble+House',
        address: 'KNUST Campus, Kumasi',
    },
     {
        id: 'r4',
        name: 'Sweet Aroma',
        cuisine: 'Local Dishes, Banku',
        rating: 4.9,
        imageUrl: 'https://placehold.co/400x300/8c2a6d/ffffff?text=Sweet+Aroma',
        address: '7 Oforikrom Bypass, Kumasi',
    },
];

export const MOCK_MENUS: { [key: string]: MenuItem[] } = {
    'r1': [
        { id: 'm1-1', name: 'Jollof Rice with Chicken', description: 'Classic smoky Ghanaian jollof rice served with grilled chicken.', price: 45.00, imageUrl: 'https://placehold.co/100x100/a43a3a/ffffff?text=Jollof' },
        { id: 'm1-2', name: 'Waakye Special', description: 'A hearty meal of rice and beans with all the accompaniments.', price: 35.00, imageUrl: 'https://placehold.co/100x100/a43a3a/ffffff?text=Waakye' },
        { id: 'm1-3', name: 'Grilled Tilapia', description: 'Whole tilapia grilled with local spices, served with banku.', price: 60.00, imageUrl: 'https://placehold.co/100x100/a43a3a/ffffff?text=Tilapia' },
    ],
    'r2': [
        { id: 'm2-1', name: 'Meat Lovers Pizza', description: 'A delicious pizza topped with sausage, beef, and pepperoni.', price: 80.00, imageUrl: 'https://placehold.co/100x100/c89211/ffffff?text=Pizza' },
        { id: 'm2-2', name: 'Chicken Wings (6 pcs)', description: 'Spicy and crispy fried chicken wings.', price: 50.00, imageUrl: 'https://placehold.co/100x100/c89211/ffffff?text=Wings' },
        { id: 'm2-3', name: 'Beef Burger & Fries', description: 'Juicy beef patty in a sesame bun, with a side of fries.', price: 55.00, imageUrl: 'https://placehold.co/100x100/c89211/ffffff?text=Burger' },
    ],
    'r3': [
        { id: 'm3-1', name: 'Sweet & Sour Chicken', description: 'Crispy chicken pieces tossed in a classic sweet and sour sauce.', price: 65.00, imageUrl: 'https://placehold.co/100x100/3e7646/ffffff?text=Chicken' },
        { id: 'm3-2', name: 'Spring Rolls (4 pcs)', description: 'Vegetable spring rolls, fried to a golden crisp.', price: 30.00, imageUrl: 'https://placehold.co/100x100/3e7646/ffffff?text=Rolls' },
        { id: 'm3-3', name: 'Special Fried Rice', description: 'Wok-fried rice with shrimp, chicken, and assorted vegetables.', price: 50.00, imageUrl: 'https://placehold.co/100x100/3e7646/ffffff?text=Rice' },
    ],
    'r4': [
        { id: 'm4-1', name: 'Banku with Okro Stew', description: 'A local favorite, soft banku with a rich, flavorful okro stew.', price: 40.00, imageUrl: 'https://placehold.co/100x100/8c2a6d/ffffff?text=Banku' },
        { id: 'm4-2', name: 'Red Red', description: 'Fried plantain with a hearty bean stew.', price: 30.00, imageUrl: 'https://placehold.co/100x100/8c2a6d/ffffff?text=Red+Red' },
        { id: 'm4-3', name: 'Fufu with Light Soup', description: 'Pounded fufu served with a spicy and aromatic light soup with goat meat.', price: 55.00, imageUrl: 'https://placehold.co/100x100/8c2a6d/ffffff?text=Fufu' },
    ],
};