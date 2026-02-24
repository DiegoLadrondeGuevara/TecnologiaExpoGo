import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Empresa
    const empresa = await prisma.empresa.create({
        data: {
            name: 'TechStore',
            logoUrl: null,
        },
    });
    console.log(`✅ Empresa created: ${empresa.name}`);

    // 2. Create AppConfig
    const config = await prisma.appConfig.create({
        data: {
            empresaId: empresa.id,
            defaultLanguage: 'en',
            defaultCurrency: 'USD',
            baseCurrency: 'USD',
            exchangeRatePEN: 3.80,
            taxRate: 0.16,
            maintenanceMode: false,
        },
    });
    console.log(`✅ AppConfig created (PEN rate: ${config.exchangeRatePEN})`);

    // 3. Create Categories
    const categoryData = [
        { name: 'Laptops', color: '#007AFF' },
        { name: 'Smartphones', color: '#34C759' },
        { name: 'Gadgets', color: '#FF9500' },
        { name: 'Tablets', color: '#AF52DE' },
        { name: 'Accessories', color: '#FF2D55' },
    ];
    const categories: Record<string, string> = {};
    for (const cat of categoryData) {
        const created = await prisma.category.create({
            data: { ...cat, empresaId: empresa.id },
        });
        categories[cat.name] = created.id;
    }
    console.log(`✅ ${categoryData.length} categories created`);

    // 4. Create Products (prices in USD)
    const productData = [
        {
            nameEn: 'MacBook Pro 16"', nameEs: 'MacBook Pro 16"',
            descriptionEn: 'The most powerful MacBook Pro ever. M3 Max chip, 48GB unified memory, Liquid Retina XDR.',
            descriptionEs: 'El MacBook Pro más potente de todos. Chip M3 Max, 48GB de memoria unificada, Liquid Retina XDR.',
            price: 2499, specs: ['M3 Max Chip', '48GB Unified Memory', '1TB SSD', '16" Liquid Retina XDR'],
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
            stock: 15, category: 'Laptops',
        },
        {
            nameEn: 'Dell XPS 15', nameEs: 'Dell XPS 15',
            descriptionEn: 'Ultra-thin and powerful. 15.6" OLED InfinityEdge display with Intel Core i9.',
            descriptionEs: 'Ultra delgado y potente. Pantalla OLED InfinityEdge de 15.6" con Intel Core i9.',
            price: 1799, specs: ['Intel Core i9', '32GB RAM', '512GB SSD', '15.6" OLED Display'],
            imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600',
            stock: 22, category: 'Laptops',
        },
        {
            nameEn: 'ThinkPad X1 Carbon', nameEs: 'ThinkPad X1 Carbon',
            descriptionEn: 'Business ultrabook with ThinkPad reliability. 14" 2.8K OLED display.',
            descriptionEs: 'Ultrabook empresarial con la fiabilidad ThinkPad. Pantalla OLED 2.8K de 14".',
            price: 1549, specs: ['Intel Core i7 vPro', '16GB RAM', '512GB SSD', '14" 2.8K OLED'],
            imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600',
            stock: 18, category: 'Laptops',
        },
        {
            nameEn: 'ASUS ROG Zephyrus', nameEs: 'ASUS ROG Zephyrus',
            descriptionEn: 'Gaming powerhouse in ultra-slim chassis. RTX 4080 with 240Hz QHD display.',
            descriptionEs: 'Potencia gaming en un chasis ultra delgado. RTX 4080 con pantalla QHD 240Hz.',
            price: 2199, specs: ['AMD Ryzen 9', 'RTX 4080', '32GB RAM', '16" 240Hz QHD'],
            imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
            stock: 10, category: 'Laptops',
        },
        {
            nameEn: 'iPhone 16 Pro Max', nameEs: 'iPhone 16 Pro Max',
            descriptionEn: 'Titanium design. A18 Pro chip. 48MP camera system with 5x Telephoto.',
            descriptionEs: 'Diseño en titanio. Chip A18 Pro. Sistema de cámara de 48MP con telefoto 5x.',
            price: 1199, specs: ['A18 Pro Chip', '256GB Storage', '48MP Camera', '6.9" Super Retina XDR'],
            imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
            stock: 30, category: 'Smartphones',
        },
        {
            nameEn: 'Samsung Galaxy S25 Ultra', nameEs: 'Samsung Galaxy S25 Ultra',
            descriptionEn: 'AI-powered smartphone with titanium frame. 200MP camera.',
            descriptionEs: 'Smartphone con IA y marco de titanio. Cámara de 200MP.',
            price: 1299, specs: ['Snapdragon 8 Elite', '12GB RAM', '200MP Camera', '6.8" Dynamic AMOLED'],
            imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
            stock: 25, category: 'Smartphones',
        },
        {
            nameEn: 'Google Pixel 9 Pro', nameEs: 'Google Pixel 9 Pro',
            descriptionEn: 'The best of Google AI in a phone. Tensor G4 chip, Magic Eraser, and 50MP triple camera.',
            descriptionEs: 'Lo mejor de Google AI en un teléfono. Chip Tensor G4, Magic Eraser y triple cámara de 50MP.',
            price: 999, specs: ['Tensor G4', '12GB RAM', '50MP Triple Camera', '6.7" LTPO OLED'],
            imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
            stock: 20, category: 'Smartphones',
        },
        {
            nameEn: 'AirPods Pro 3', nameEs: 'AirPods Pro 3',
            descriptionEn: 'Adaptive Audio, Personalized Spatial Audio, and 2x Active Noise Cancellation.',
            descriptionEs: 'Audio Adaptativo, Audio Espacial Personalizado y 2x Cancelación Activa de Ruido.',
            price: 249, specs: ['H3 Chip', 'Adaptive Audio', 'USB-C', '6h Battery Life'],
            imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600',
            stock: 50, category: 'Gadgets',
        },
        {
            nameEn: 'Apple Watch Ultra 3', nameEs: 'Apple Watch Ultra 3',
            descriptionEn: 'The most rugged Apple Watch with dual-frequency GPS and 72-hour battery.',
            descriptionEs: 'El Apple Watch más resistente con GPS de doble frecuencia y 72 horas de batería.',
            price: 799, specs: ['S10 Chip', '49mm Titanium', '72h Battery', '3000 nits Display'],
            imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
            stock: 12, category: 'Gadgets',
        },
        {
            nameEn: 'Sony WH-1000XM6', nameEs: 'Sony WH-1000XM6',
            descriptionEn: 'Industry-leading noise cancellation with 40-hour battery.',
            descriptionEs: 'Cancelación de ruido líder en la industria con 40 horas de batería.',
            price: 349, specs: ['V2 Processor', 'LDAC Hi-Res', '40h Battery', 'Multipoint Connection'],
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            stock: 35, category: 'Gadgets',
        },
        {
            nameEn: 'Meta Quest 4', nameEs: 'Meta Quest 4',
            descriptionEn: 'Next-gen mixed reality headset with full-color passthrough and eye tracking.',
            descriptionEs: 'Visor de realidad mixta de próxima generación con passthrough a color y seguimiento ocular.',
            price: 499, specs: ['Snapdragon XR3', '12GB RAM', '4K per eye', '2h Active Battery'],
            imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600',
            stock: 8, category: 'Gadgets',
        },
    ];

    for (const product of productData) {
        const { category, ...data } = product;
        await prisma.product.create({
            data: {
                ...data,
                categoryId: categories[category],
                empresaId: empresa.id,
            },
        });
    }
    console.log(`✅ ${productData.length} products created`);

    // 5. Create Users
    const newAdminHash = await bcrypt.hash('admin', 10); // Hash para la contraseña "admin"
    const adminHash = await bcrypt.hash('admin123', 10);
    const customerHash = await bcrypt.hash('customer123', 10);

    await prisma.user.createMany({
        data: [
            // El usuario que pediste
            { name: 'admin', email: 'admin@mail.com', passwordHash: newAdminHash, role: 'ADMIN', empresaId: empresa.id },

            // Los usuarios que ya tenías
            { name: 'Admin TechStore', email: 'admin@techstore.com', passwordHash: adminHash, role: 'ADMIN', empresaId: empresa.id },
            { name: 'Carlos Mendoza', email: 'carlos@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
            { name: 'Maria García', email: 'maria@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
            { name: 'John Smith', email: 'john@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
            { name: 'Ana López', email: 'ana@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
            { name: 'David Chen', email: 'david@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
            { name: 'Sofia Torres', email: 'sofia@email.com', passwordHash: customerHash, role: 'CUSTOMER', empresaId: empresa.id },
        ],
    });
    console.log('✅ 8 users created (2 admin + 6 customers)');
    console.log('   📧 Admin Nuevo: admin@mail.com / admin');
    console.log('   📧 Admin Anterior: admin@techstore.com / admin123');

    console.log('\n🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });