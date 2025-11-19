// Philippine Provinces, Cities, and Barangays Data
// Simplified version with major locations - can be expanded as needed

export interface Barangay {
    name: string;
}

export interface City {
    name: string;
    barangays: string[];
}

export interface Province {
    name: string;
    cities: City[];
}

export const philippineLocations: Province[] = [
    // NATIONAL CAPITAL REGION (NCR)
    {
        name: 'Metro Manila',
        cities: [
            {
                name: 'Manila',
                barangays: ['Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 'Sampaloc', 'San Miguel', 'Santa Ana', 'Santa Cruz', 'Tondo']
            },
            {
                name: 'Quezon City',
                barangays: ['Bagong Pag-asa', 'Batasan Hills', 'Commonwealth', 'Cubao', 'Diliman', 'Fairview', 'Kamuning', 'Novaliches', 'Project 4', 'Project 6', 'Project 8', 'San Bartolome', 'Santa Mesa Heights', 'Teachers Village']
            },
            {
                name: 'Makati',
                barangays: ['Bel-Air', 'Carmona', 'Dasmariñas', 'Forbes Park', 'Guadalupe Nuevo', 'Guadalupe Viejo', 'Magallanes', 'Poblacion', 'San Antonio', 'San Lorenzo', 'Urdaneta', 'Valenzuela']
            },
            {
                name: 'Taguig',
                barangays: ['Bagumbayan', 'Bambang', 'Calzada', 'Central Bicutan', 'Central Signal Village', 'Fort Bonifacio', 'Hagonoy', 'Ibayo-Tipas', 'Katuparan', 'Ligid-Tipas', 'Lower Bicutan', 'Maharlika Village', 'Napindan', 'New Lower Bicutan', 'North Signal Village', 'Palingon', 'Pinagsama', 'San Miguel', 'Santa Ana', 'South Signal Village', 'Tanyag', 'Tuktukan', 'Ususan', 'Wawa', 'Western Bicutan']
            },
            {
                name: 'Pasig',
                barangays: ['Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Buting', 'Caniogan', 'Dela Paz', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga', 'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad', 'San Antonio', 'San Joaquin', 'San Jose', 'San Miguel', 'San Nicolas', 'Santa Cruz', 'Santa Lucia', 'Santa Rosa', 'Santo Tomas', 'Santolan', 'Sumilang', 'Ugong']
            },
            {
                name: 'Mandaluyong',
                barangays: ['Addition Hills', 'Bagong Silang', 'Barangka Drive', 'Barangka Ibaba', 'Barangka Ilaya', 'Barangka Itaas', 'Buayang Bato', 'Burol', 'Daang Bakal', 'Hagdang Bato Itaas', 'Hagdang Bato Libis', 'Harapin Ang Bukas', 'Highway Hills', 'Hulo', 'Mabini-J. Rizal', 'Malamig', 'Mauway', 'Namayan', 'New Zañiga', 'Old Zañiga', 'Pag-asa', 'Plainview', 'Pleasant Hills', 'Poblacion', 'San Jose', 'Vergara', 'Wack-Wack Greenhills']
            },
            {
                name: 'Pasay',
                barangays: ['Baclaran', 'Bayview', 'Don Galo', 'Libertad', 'Malibay', 'Maricaban', 'Parañaque', 'San Isidro', 'San Rafael', 'San Roque', 'Santa Clara', 'Santo Niño', 'Tambo', 'Tramo', 'Vitalez']
            },
            {
                name: 'Parañaque',
                barangays: ['Baclaran', 'BF Homes', 'Don Bosco', 'Don Galo', 'La Huerta', 'Marcelo Green', 'Merville', 'Moonwalk', 'San Antonio', 'San Dionisio', 'San Isidro', 'San Martin de Porres', 'Santo Niño', 'Sun Valley', 'Tambo', 'Vitalez']
            },
            {
                name: 'Caloocan',
                barangays: ['Bagong Barrio', 'Bagong Silang', 'Bagumbong', 'Camarin', 'Grace Park', 'Kaunlaran', 'Maypajo', 'Sangandaan', 'Tala', 'Tandang Sora']
            },
            {
                name: 'Las Piñas',
                barangays: ['Almanza Dos', 'Almanza Uno', 'BF International', 'Daniel Fajardo', 'Elias Aldana', 'Ilaya', 'Manuyo Dos', 'Manuyo Uno', 'Pamplona Dos', 'Pamplona Tres', 'Pamplona Uno', 'Pilar', 'Pulang Lupa Dos', 'Pulang Lupa Uno', 'Talon Dos', 'Talon Kuatro', 'Talon Singko', 'Talon Tres', 'Talon Uno', 'Zapote']
            },
            {
                name: 'Muntinlupa',
                barangays: ['Alabang', 'Ayala Alabang', 'Bayanan', 'Buli', 'Cupang', 'Poblacion', 'Putatan', 'Sucat', 'Tunasan']
            },
            {
                name: 'Navotas',
                barangays: ['Bagumbayan North', 'Bagumbayan South', 'Bangculasi', 'Daanghari', 'Navotas East', 'Navotas West', 'North Bay Boulevard North', 'North Bay Boulevard South', 'San Jose', 'San Rafael Village', 'San Roque', 'Sipac-Almacen', 'Tangos North', 'Tangos South', 'Tanza']
            },
            {
                name: 'Malabon',
                barangays: ['Acacia', 'Baritan', 'Bayan-Bayanan', 'Catmon', 'Concepcion', 'Dampalit', 'Flores', 'Hulong Duhat', 'Ibaba', 'Longos', 'Maysilo', 'Muzon', 'Niugan', 'Panghulo', 'Potrero', 'San Agustin', 'Santolan', 'Tañong', 'Tinajeros', 'Tonsuya', 'Tugatog']
            },
            {
                name: 'Valenzuela',
                barangays: ['Arkong Bato', 'Bagbaguin', 'Balangkas', 'Bignay', 'Bisig', 'Canumay East', 'Canumay West', 'Coloong', 'Dalandanan', 'Hen. T. de Leon', 'Isla', 'Karuhatan', 'Lawang Bato', 'Lingunan', 'Mabolo', 'Malanday', 'Malinta', 'Mapulang Lupa', 'Marulas', 'Maysan', 'Palasan', 'Parada', 'Pariancillo Villa', 'Paso de Blas', 'Pasolo', 'Poblacion', 'Punturin', 'Rincon', 'Tagalag', 'Ugong', 'Viente Reales', 'Wawang Pulo']
            },
            {
                name: 'Marikina',
                barangays: ['Barangka', 'Calumpang', 'Concepcion Dos', 'Concepcion Uno', 'Fortune', 'Industrial Valley', 'Jesus de la Peña', 'Malanday', 'Marikina Heights', 'Nangka', 'Parang', 'San Roque', 'Santa Elena', 'Santo Niño', 'Tañong', 'Tumana']
            },
            {
                name: 'San Juan',
                barangays: ['Addition Hills', 'Balong-Bato', 'Batis', 'Corazon de Jesus', 'Ermitaño', 'Greenhills', 'Halo-Halo', 'Isabelita', 'Kabayanan', 'Little Baguio', 'Maytunas', 'Onse', 'Pasadena', 'Pedro Cruz', 'Progreso', 'Rivera', 'Salapan', 'San Perfecto', 'Santa Lucia', 'Tibagan', 'West Crame']
            }
        ]
    },
    {
        name: 'Cavite',
        cities: [
            {
                name: 'Bacoor',
                barangays: ['Alima', 'Aniban I', 'Aniban II', 'Aniban III', 'Aniban IV', 'Aniban V', 'Banalo', 'Bayanan', 'Daang Bukid', 'Digman', 'Dulong Bayan', 'Habay I', 'Habay II', 'Kaingin', 'Ligas I', 'Ligas II', 'Ligas III', 'Mabolo I', 'Mabolo II', 'Mabolo III', 'Maliksi I', 'Maliksi II', 'Maliksi III', 'Mambog I', 'Mambog II', 'Mambog III', 'Mambog IV', 'Mambog V', 'Molino I', 'Molino II', 'Molino III', 'Molino IV', 'Molino V', 'Molino VI', 'Molino VII', 'Niog I', 'Niog II', 'Niog III', 'Panapaan I', 'Panapaan II', 'Panapaan III', 'Panapaan IV', 'Panapaan V', 'Panapaan VI', 'Panapaan VII', 'Panapaan VIII', 'Poblacion', 'Queens Row Central', 'Queens Row East', 'Queens Row West', 'Real I', 'Real II', 'Salinas I', 'Salinas II', 'Salinas III', 'Salinas IV', 'San Nicolas I', 'San Nicolas II', 'San Nicolas III', 'Sineguelasan', 'Tabing Dagat', 'Talaba I', 'Talaba II', 'Talaba III', 'Talaba IV', 'Talaba V', 'Talaba VI', 'Talaba VII', 'Zapote I', 'Zapote II', 'Zapote III', 'Zapote IV', 'Zapote V']
            },
            {
                name: 'Imus',
                barangays: ['Alapan I-A', 'Alapan I-B', 'Alapan II-A', 'Alapan II-B', 'Anabu I-A', 'Anabu I-B', 'Anabu I-C', 'Anabu I-D', 'Anabu I-E', 'Anabu I-F', 'Anabu I-G', 'Anabu II-A', 'Anabu II-B', 'Anabu II-C', 'Anabu II-D', 'Anabu II-E', 'Anabu II-F', 'Bayan Luma I', 'Bayan Luma II', 'Bayan Luma III', 'Bayan Luma IV', 'Bayan Luma V', 'Bayan Luma VI', 'Bayan Luma VII', 'Bayan Luma VIII', 'Bucandala I', 'Bucandala II', 'Bucandala III', 'Bucandala IV', 'Bucandala V', 'Buhay na Tubig', 'Carsadang Bago I', 'Carsadang Bago II', 'Magdalo', 'Maharlika', 'Malagasang I-A', 'Malagasang I-B', 'Malagasang I-C', 'Malagasang I-D', 'Malagasang I-E', 'Malagasang I-F', 'Malagasang I-G', 'Malagasang II-A', 'Malagasang II-B', 'Malagasang II-C', 'Malagasang II-D', 'Malagasang II-E', 'Malagasang II-F', 'Malagasang II-G', 'Medicion I-A', 'Medicion I-B', 'Medicion I-C', 'Medicion I-D', 'Medicion II-A', 'Medicion II-B', 'Medicion II-C', 'Medicion II-D', 'Medicion II-E', 'Medicion II-F', 'Pag-asa I', 'Pag-asa II', 'Pag-asa III', 'Palico I', 'Palico II', 'Palico III', 'Palico IV', 'Pasong Buaya I', 'Pasong Buaya II', 'Poblacion I-A', 'Poblacion I-B', 'Poblacion I-C', 'Poblacion II-A', 'Poblacion II-B', 'Poblacion III-A', 'Poblacion III-B', 'Poblacion IV-A', 'Poblacion IV-B', 'Poblacion IV-C', 'Poblacion IV-D', 'Tanzang Luma I', 'Tanzang Luma II', 'Tanzang Luma III', 'Tanzang Luma IV', 'Tanzang Luma V', 'Tanzang Luma VI', 'Toclong I-A', 'Toclong I-B', 'Toclong I-C', 'Toclong II-A', 'Toclong II-B']
            },
            {
                name: 'Dasmariñas',
                barangays: ['Burol', 'Salawag', 'San Agustin I', 'San Agustin II', 'San Agustin III', 'Victoria Reyes', 'Emmanuel Bergado I', 'Emmanuel Bergado II', 'H-2', 'Paliparan I', 'Paliparan II', 'Paliparan III', 'Salitran I', 'Salitran II', 'Salitran III', 'Salitran IV', 'Sampaloc I', 'Sampaloc II', 'Sampaloc III', 'Sampaloc IV', 'Sampaloc V', 'San Dionisio', 'San Esteban', 'San Isidro Labrador I', 'San Isidro Labrador II', 'San Jose', 'San Lorenzo Ruiz', 'San Luis I', 'San Luis II', 'San Manuel I', 'San Manuel II', 'San Mateo', 'San Miguel I', 'San Miguel II', 'San Nicolas I', 'San Nicolas II', 'San Roque', 'San Simon', 'Santa Cristina I', 'Santa Cristina II', 'Santa Cruz I', 'Santa Cruz II', 'Santa Fe', 'Santa Lucia', 'Santa Maria', 'Santiago', 'Santo Cristo', 'Santo Niño I', 'Santo Niño II', 'Langkaan I', 'Langkaan II', 'Luzviminda I', 'Luzviminda II', 'Sabang']
            },
            {
                name: 'Cavite City',
                barangays: ['Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35', 'Barangay 36', 'Barangay 37', 'Barangay 38', 'Barangay 39', 'Barangay 40', 'Barangay 41', 'Barangay 42', 'Barangay 43', 'Barangay 44', 'Barangay 45', 'Barangay 46', 'Barangay 47', 'Barangay 48', 'Barangay 49', 'Barangay 50', 'Barangay 51', 'Barangay 52', 'Barangay 53', 'Barangay 54', 'Barangay 55', 'Barangay 56', 'Barangay 57', 'Barangay 58', 'Barangay 59', 'Barangay 60', 'Barangay 61', 'Barangay 62', 'Barangay 63', 'Barangay 64', 'Barangay 65', 'Barangay 66', 'Barangay 67', 'Barangay 68', 'Barangay 69', 'Barangay 70', 'Barangay 71', 'Barangay 72', 'Barangay 73', 'Barangay 74', 'Barangay 75', 'Barangay 76', 'Barangay 77', 'Barangay 78', 'Barangay 79', 'Barangay 80', 'Barangay 81', 'Barangay 82', 'Barangay 83', 'Barangay 84']
            },
            {
                name: 'General Trias',
                barangays: ['Alingaro', 'Arnaldo Poblacion', 'Bacao I', 'Bacao II', 'Bagumbayan Poblacion', 'Biclatan', 'Buenavista I', 'Buenavista II', 'Buenavista III', 'Corregidor Poblacion', 'Dulong Bayan Poblacion', 'Gov. Ferrer Poblacion', 'Javalera', 'Manggahan', 'Navarro', 'Ninety Sixth Poblacion', 'Panungyanan', 'Pasong Camachile I', 'Pasong Camachile II', 'Pasong Kawayan I', 'Pasong Kawayan II', 'Pinagtipunan', 'Prinza Poblacion', 'Sampalucan Poblacion', 'San Francisco', 'San Gabriel Poblacion', 'San Juan I', 'San Juan II', 'Santa Clara', 'Santiago', 'Tapia', 'Tejero', 'Vibora Poblacion']
            }
        ]
    },
    {
        name: 'Laguna',
        cities: [
            {
                name: 'Santa Rosa',
                barangays: ['Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita', 'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling', 'Malitlit', 'Malusak', 'Market Area', 'Pooc', 'Pulong Santa Cruz', 'Pulo', 'Santo Domingo', 'Sinalhan', 'Tagapo']
            },
            {
                name: 'Biñan',
                barangays: ['Biñan', 'Bungahan', 'Canlalay', 'Casile', 'De La Paz', 'Ganado', 'Langkiwa', 'Loma', 'Malaban', 'Malamig', 'Mamplasan', 'Platero', 'Poblacion', 'San Antonio', 'San Francisco', 'San Jose', 'San Vicente', 'Santo Domingo', 'Santo Niño', 'Santo Tomas', 'Soro-soro', 'Timbao', 'Tubigan', 'Zapote']
            },
            {
                name: 'Calamba',
                barangays: ['Bagong Kalsada', 'Banadero', 'Banlic', 'Barandal', 'Barangay Dos', 'Barangay Tres', 'Barangay Uno', 'Batino', 'Bubuyan', 'Bucal', 'Bunggo', 'Burol', 'Camaligan', 'Canlubang', 'Halang', 'Hornalan', 'Kay-Anlog', 'La Mesa', 'Laguerta', 'Lawa', 'Lecheria', 'Lingga', 'Looc', 'Mabato', 'Majada Labas', 'Makiling', 'Mapagong', 'Masili', 'Maunong', 'Mayapa', 'Milagrosa', 'Paciano Rizal', 'Palingon', 'Palo-Alto', 'Pansol', 'Parian', 'Prinza', 'Punta', 'Puting Lupa', 'Real', 'Sampiruhan', 'San Cristobal', 'San Jose', 'San Juan', 'Sirang Lupa', 'Saimsim', 'Sucol', 'Turbina', 'Ulango', 'Uwisan']
            },
            {
                name: 'San Pedro',
                barangays: ['Bagong Silang', 'Calendola', 'Chrysanthemum', 'Cuyab', 'Estrella', 'G.S.I.S.', 'Landayan', 'Langgam', 'Laram', 'Magsaysay', 'Maharlika', 'Narra', 'Nueva', 'Pacita I', 'Pacita II', 'Poblacion', 'Rosario', 'Sampaguita Village', 'San Antonio', 'San Lorenzo Ruiz', 'San Roque', 'San Vicente', 'Santo Niño', 'United Bayanihan', 'United Better Living']
            },
            {
                name: 'Cabuyao',
                barangays: ['Banaybanay', 'Banlic', 'Barangay Dos Poblacion', 'Barangay Tres Poblacion', 'Barangay Uno Poblacion', 'Bigaa', 'Butong', 'Casile', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland', 'Pulo', 'Sala', 'San Isidro']
            }
        ]
    },
    {
        name: 'Rizal',
        cities: [
            {
                name: 'Antipolo',
                barangays: ['Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang', 'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot', 'Muntinlupa', 'San Isidro', 'San Jose', 'San Juan', 'San Luis', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Silangan']
            },
            {
                name: 'Cainta',
                barangays: ['San Andres', 'San Isidro', 'San Juan', 'San Roque', 'Santa Rosa']
            },
            {
                name: 'Taytay',
                barangays: ['Dolores', 'San Isidro', 'San Juan', 'Santa Ana', 'Muzon']
            },
            {
                name: 'Rodriguez (Montalban)',
                barangays: ['Balite', 'Burgos', 'Geronimo', 'Macabud', 'Manggahan', 'Mascap', 'Puray', 'Rosario', 'San Isidro', 'San Jose', 'San Rafael']
            }
        ]
    },
    {
        name: 'Bulacan',
        cities: [
            {
                name: 'Malolos',
                barangays: ['Anilao', 'Atlag', 'Babatnin', 'Bagna', 'Bagong Bayan', 'Balayong', 'Balite', 'Bangkal', 'Barihan', 'Bulihan', 'Bungahan', 'Caingin', 'Calero', 'Caliligawan', 'Canalate', 'Caniogan', 'Catmon', 'Cofradia', 'Dakila', 'Guinhawa', 'Ligas', 'Liyang', 'Longos', 'Look 1st', 'Look 2nd', 'Lugam', 'Mabolo', 'Mambog', 'Masile', 'Matimbo', 'Mojon', 'Namayan', 'Niugan', 'Pamarawan', 'Panasahan', 'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan', 'San Pablo', 'San Vicente', 'Santiago', 'Santisima Trinidad', 'Santo Cristo', 'Santo Niño', 'Santo Rosario', 'Santol', 'Sumapang Bata', 'Sumapang Matanda', 'Taal', 'Tikay']
            },
            {
                name: 'Meycauayan',
                barangays: ['Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo', 'Camalig', 'Calvario', 'Hulo', 'Iba', 'Langka', 'Lawa', 'Libtong', 'Liputan', 'Longos', 'Malhacan', 'Pajo', 'Pandayan', 'Pantoc', 'Perez', 'Poblacion', 'Saluysoy', 'St. Francis', 'Tugatog', 'Ubihan', 'Zamora']
            },
            {
                name: 'San Jose del Monte',
                barangays: ['Assumption', 'Bagong Buhay I', 'Bagong Buhay II', 'Bagong Buhay III', 'Citrus', 'Ciudad Real', 'Dulong Bayan', 'Fatima I', 'Fatima II', 'Fatima III', 'Fatima IV', 'Fatima V', 'Francisco Homes-Guijo', 'Francisco Homes-Mulawin', 'Francisco Homes-Narra', 'Francisco Homes-Yakal', 'Gaya-gaya', 'Graceville', 'Gumaoc Central', 'Gumaoc East', 'Gumaoc West', 'Kaybanban', 'Kaypian', 'Lawang Pari', 'Maharlika', 'Minuyan I', 'Minuyan II', 'Minuyan III', 'Minuyan IV', 'Minuyan Proper', 'Minuyan V', 'Muzon', 'Paradise III', 'Poblacion', 'Richmond', 'San Isidro', 'San Manuel', 'San Martin I', 'San Martin II', 'San Martin III', 'San Martin IV', 'San Pedro', 'San Rafael I', 'San Rafael III', 'San Rafael IV', 'San Rafael V', 'San Roque', 'Santa Cruz I', 'Santa Cruz II', 'Santa Cruz III', 'Santa Cruz IV', 'Santa Cruz V', 'Santo Cristo', 'Santo Niño', 'Santo Niño II', 'Sapang Palay', 'St. Martin de Porres', 'Tayabasan', 'Tungkong Mangga']
            }
        ]
    },
    {
        name: 'Pampanga',
        cities: [
            {
                name: 'San Fernando',
                barangays: ['Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Del Carmen', 'Del Pilar', 'Del Rosario', 'Dela Paz Norte', 'Dela Paz Sur', 'Dolores', 'Juliana', 'Lara', 'Lourdes', 'Magliman', 'Maimpis', 'Malino', 'Malpitic', 'Pandaras', 'Panipuan', 'Pulung Bulu', 'Quebiawan', 'Saguin', 'San Agustin', 'San Felipe', 'San Isidro', 'San Jose', 'San Juan', 'San Nicolas', 'San Pedro', 'Santa Lucia', 'Santa Teresita', 'Santo Niño', 'Santo Rosario', 'Sindalan', 'Telabastagan']
            },
            {
                name: 'Angeles City',
                barangays: ['Agapito del Rosario', 'Amsic', 'Anunas', 'Balibago', 'Capaya', 'Claro M. Recto', 'Cuayan', 'Cutcut', 'Cutud', 'Lourdes Northwest', 'Lourdes Sur', 'Malabanias', 'Margot', 'Mining', 'Pampang', 'Pandan', 'Pulung Maragul', 'Pulungbulu', 'Salapungan', 'San Jose', 'San Nicolas', 'Santa Teresita', 'Santa Trinidad', 'Santo Cristo', 'Santo Domingo', 'Santo Rosario', 'Sapangbato', 'Tabun', 'Virgen Delos Remedios']
            },
            {
                name: 'Mabalacat',
                barangays: ['Atlu-Bola', 'Bical', 'Bundagul', 'Cacutud', 'Calumpang', 'Camachiles', 'Dapdap', 'Dau', 'Dolores', 'Duquit', 'Lakandula', 'Mabiga', 'Macapagal Village', 'Mamatitang', 'Mangalit', 'Manuali', 'Marcos Village', 'Paralayunan', 'Poblacion', 'San Francisco', 'San Joaquin', 'Santa Ines', 'Santa Maria', 'Santo Rosario', 'Sapang Balen', 'Sapang Biabas', 'Tabun']
            }
        ]
    },
    {
        name: 'Cebu',
        cities: [
            {
                name: 'Cebu City',
                barangays: ['Apas', 'Banilad', 'Basak San Nicolas', 'Busay', 'Calamba', 'Cambinocot', 'Capitol Site', 'Carreta', 'Cogon Ramos', 'Ermita', 'Guadalupe', 'Kasambagan', 'Labangon', 'Lahug', 'Lorega San Miguel', 'Mabolo', 'Pahina Central', 'Pardo', 'Punta Princesa', 'Sambag I', 'Sambag II', 'San Antonio', 'San Jose', 'San Nicolas Central', 'Suba', 'Talamban', 'Tisa', 'Zapatera']
            },
            {
                name: 'Mandaue',
                barangays: ['Alang-alang', 'Bakilid', 'Banilad', 'Basak', 'Cabancalan', 'Cambaro', 'Canduman', 'Casili', 'Casuntingan', 'Centro', 'Cubacub', 'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc', 'Maguikay', 'Mantuyong', 'Opao', 'Pakna-an', 'Pagsabungan', 'Subangdaku', 'Tabok', 'Tingub', 'Tipolo', 'Umapad']
            },
            {
                name: 'Lapu-Lapu',
                barangays: ['Agus', 'Babag', 'Bankal', 'Baring', 'Basak', 'Buaya', 'Calawisan', 'Canjulao', 'Caw-oy', 'Cawhagan', 'Caubian', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Marigondon', 'Maribago', 'Pajac', 'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Sabang', 'Santa Rosa', 'Subabasbas', 'Talima', 'Tingo', 'Tingub', 'Tudela', 'Tungasan']
            }
        ]
    },
    {
        name: 'Davao del Sur',
        cities: [
            {
                name: 'Davao City',
                barangays: ['Acacia', 'Agdao', 'Bago Aplaya', 'Bago Gallera', 'Baguio', 'Balingasan', 'Bangkas Heights', 'Bantol', 'Bato', 'Bayabas', 'Binugao', 'Bucana', 'Buhangin', 'Bunawan', 'Calinan', 'Callawa', 'Carmen', 'Catalunan Grande', 'Catalunan Pequeno', 'Cawayan', 'Communal', 'Crossing Bayabas', 'Daliao', 'Darong', 'Eden', 'Fatima', 'Gumitan', 'Inayangan', 'Kabacan', 'Kilate', 'Lacson', 'Langub', 'Leon Garcia', 'Lizada', 'Los Amigos', 'Ma-a', 'Magtuod', 'Mahayag', 'Malabog', 'Malagos', 'Malamba', 'Manambulan', 'Mandug', 'Manuel Guianga', 'Marilog', 'Matina Aplaya', 'Matina Crossing', 'Matina Pangi', 'Mintal', 'Mudiang', 'Mulig', 'New Carmen', 'New Valencia', 'Pampanga', 'Panacan', 'Panalum', 'Paquibato', 'Paradise Embac', 'Rafael Castillo', 'Riverside', 'San Antonio', 'Santo Niño', 'Sibulan', 'Sirawan', 'Soro-soro', 'Subasta', 'Sumimao', 'Tacunan', 'Tagakpan', 'Talandang', 'Talomo', 'Tamayong', 'Tamugan', 'Tawan-tawan', 'Tibuloy', 'Tibungco', 'Tigatto', 'Toril', 'Tugbok', 'Tungkalan', 'Ula', 'Waan', 'Wangan', 'Wilfredo Aquino']
            }
        ]
    },
    // REGION VI - WESTERN VISAYAS (Including Negros Occidental)
    {
        name: 'Negros Occidental',
        cities: [
            {
                name: 'Bacolod City',
                barangays: ['Alijis', 'Alangilan', 'Banago', 'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Barangay 13', 'Barangay 14', 'Barangay 15', 'Barangay 16', 'Barangay 17', 'Barangay 18', 'Barangay 19', 'Barangay 20', 'Barangay 21', 'Barangay 22', 'Barangay 23', 'Barangay 24', 'Barangay 25', 'Barangay 26', 'Barangay 27', 'Barangay 28', 'Barangay 29', 'Barangay 30', 'Barangay 31', 'Barangay 32', 'Barangay 33', 'Barangay 34', 'Barangay 35', 'Barangay 36', 'Barangay 37', 'Barangay 38', 'Barangay 39', 'Barangay 40', 'Barangay 41', 'Bata', 'Cabug', 'Estefania', 'Felisa', 'Granada', 'Handumanan', 'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy', 'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing', 'Tangub', 'Villamonte']
            },
            {
                name: 'Silay City',
                barangays: ['Bagtic', 'Balaring', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI', 'Carpizo', 'Eustaquio Lopez', 'Guimbala-on', 'Guinhalaran', 'Hawaiian', 'Kapitan Ramon', 'Lantad', 'Mambulac', 'Patag']
            },
            {
                name: 'Talisay City',
                barangays: ['Cabatangan', 'Cambugsa', 'Dos Hermanas', 'Efigenio Lizares', 'Katilingban', 'Matab-ang', 'Zone 1', 'Zone 10', 'Zone 11', 'Zone 12', 'Zone 12-A', 'Zone 13', 'Zone 14', 'Zone 14-B', 'Zone 15', 'Zone 16', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9']
            },
            {
                name: 'Bago City',
                barangays: ['Abuanan', 'Alianza', 'Atipuluan', 'Bacong-Montilla', 'Bagroy', 'Balingasag', 'Binubuhan', 'Busay', 'Calumangan', 'Caridad', 'Dulao', 'Lag-asan', 'Ma-ao Barrio', 'Ma-ao Central', 'Mailum', 'Malingin', 'Napoles', 'Pacol', 'Poblacion', 'Sampinit', 'Taloc', 'Tabunan']
            },
            {
                name: 'Cadiz City',
                barangays: ['Andres Bonifacio', 'Banquerohan', 'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Cabahug', 'Cadiz Viejo', 'Caduha-an', 'Celestino Villacin', 'Daga', 'Luna', 'Mabini', 'Magsaysay', 'Sicaba', 'Tiglawigan', 'Tinampa-an', 'Tinampa-an Nuevo', 'V.F. Gustilo']
            },
            {
                name: 'Sagay City',
                barangays: ['Andres Bonifacio', 'Bato', 'Baviera', 'Bulanon', 'Campo Himoga-an', 'Campo Santiago', 'Colonia Divina', 'Fabrica', 'General Luna', 'Himoga-an Baybay', 'Lopez Jaena', 'Malubon', 'Old Sagay', 'Paraiso', 'Plaridel', 'Poblacion I', 'Poblacion II', 'Puey', 'Rafaela Barrera', 'Rizal', 'Taba-ao', 'Tadlong', 'Vigo']
            },
            {
                name: 'Victorias City',
                barangays: ['Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI-A', 'Barangay VI-B', 'Barangay VII', 'Barangay VIII', 'Barangay IX', 'Barangay X', 'Barangay XI', 'Barangay XII', 'Barangay XIII', 'Barangay XIV', 'Barangay XV', 'Barangay XVI', 'Barangay XVII', 'Barangay XVIII', 'Barangay XIX', 'Barangay XIX-A', 'Barangay XX', 'Barangay XXI']
            },
            {
                name: 'Hinoba-an',
                barangays: ['Bacuyangan', 'Bago', 'Bulwangan', 'Bunga', 'Culipapa', 'Damutan', 'Goma', 'Macagawon', 'Maitum', 'Nabulao', 'Pandanon', 'Poblacion', 'Talacagay', 'Culilang']
            },
            {
                name: 'Binalbagan',
                barangays: ['Amontay', 'Bagroy', 'Bi-ao', 'Canmoros', 'Enclaro', 'Marina', 'Paglaum', 'Payao', 'Poblacion', 'San Pedro', 'San Jose', 'San Juan', 'San Rafael', 'San Vicente', 'Santissima Trinidad']
            },
            {
                name: 'Cauayan',
                barangays: ['Abaca', 'Basak', 'Bulata', 'Caliling', 'Camalobalo', 'Camindangan', 'Guiljungan', 'Linaon', 'Poblacion', 'Sag-on', 'Talacdan', 'Tambad']
            },
            {
                name: 'Escalante',
                barangays: ['Alimango', 'Balintawak', 'Binaguiohan', 'Buenavista', 'Cervantes', 'Dian-ay', 'Hacienda Fe', 'Japitan', 'Jonobjonob', 'Langub', 'Libertad', 'Mabini', 'Magsaysay', 'Old Poblacion', 'Paitan', 'Pinapugasan', 'Rizal', 'Tamlang', 'Udtongan', 'Washington']
            },
            {
                name: 'Himamaylan',
                barangays: ['Aguisan', 'Buenavista', 'Cabadiangan', 'Cabanbanan', 'Carabalan', 'Libacao', 'Mabini', 'Mahalang', 'Poblacion', 'San Antonio', 'Sara-et', 'Su-ay', 'Talaban']
            },
            {
                name: 'Kabankalan',
                barangays: ['Bantayan', 'Binicuil', 'Camugao', 'Hilamonan', 'Inapoy', 'Magballo', 'Oringao', 'Orong', 'Poblacion', 'Salong', 'Tan-awan', 'Tagukon', 'Talubangi']
            },
            {
                name: 'La Carlota',
                barangays: ['Ara-al', 'Ayungon', 'Balabag', 'Batuan', 'Haguimit', 'La Granja', 'Yubo', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'Rocky Hill']
            },
            {
                name: 'La Castellana',
                barangays: ['Biak-na-Bato', 'Cabacungan', 'Cabagnaan', 'Lamazon', 'Manghanoy', 'Mansalanao', 'Puso', 'Robles', 'Sag-ang']
            },
            {
                name: 'Manapla',
                barangays: ['Chambery', 'La Granja', 'Punta Mesa', 'Punta Salong', 'Poblacion', 'San Pablo', 'Tortosa']
            },
            {
                name: 'Murcia',
                barangays: ['Alegria', 'Amayco', 'Baja', 'Balabag', 'Bato', 'Blumentritt', 'Caliban', 'Canlandog', 'Cansilayan', 'Lopez Jaena', 'Minoyan', 'Pandanon', 'Poblacion', 'Salvacion', 'San Isidro']
            },
            {
                name: 'Pontevedra',
                barangays: ['Antipolo', 'Bacong', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI', 'Barangay VII', 'Barangay VIII', 'Cambarus', 'Miranda', 'Recreo']
            },
            {
                name: 'Pulupandan',
                barangays: ['Barangay Zone I', 'Barangay Zone II', 'Barangay Zone III', 'Barangay Zone IV', 'Barangay Zone V', 'Barangay Zone VI', 'Pag-Asa', 'Palaka Norte', 'Palaka Sur', 'Pasyungan', 'Ticuran', 'Utod']
            },
            {
                name: 'San Carlos',
                barangays: ['Bagonbon', 'Buluangan', 'Codcod', 'Guadalupe', 'Nataban', 'Palampas', 'Prosperidad', 'Punao', 'Quezon', 'Rizal', 'San Juan']
            },
            {
                name: 'Sipalay',
                barangays: ['Cabadiangan', 'Camindangan', 'Canturay', 'Gil Montilla', 'Mambaroto', 'Maricalum', 'Nauhang', 'Poblacion', 'San Jose']
            },
            {
                name: 'Toboso',
                barangays: ['Bandila', 'Bug-ang', 'General Luna', 'Magticol', 'Poblacion', 'Salamanca', 'San Isidro', 'San Jose', 'Tabun-ac']
            },
            {
                name: 'Valladolid',
                barangays: ['Alijis', 'Ayungon', 'Bagumbayan', 'Batuan', 'Cabagnaan', 'Doldol', 'Guintubhan', 'Mabini', 'Palaka', 'Poblacion']
            }
        ]
    },
    {
        name: 'Iloilo',
        cities: [
            {
                name: 'Iloilo City',
                barangays: ['Arevalo', 'Bo. Obrero', 'Brgy. 1', 'Brgy. 2', 'City Proper', 'Jaro', 'La Paz', 'Lapuz', 'Mandurriao', 'Molo']
            },
            {
                name: 'Passi City',
                barangays: ['Agdahon', 'Aglalana', 'Agcalaga', 'Ayuyan', 'Batu', 'Bochog', 'Buyo', 'Cadilang', 'Cairohan', 'Dalicanan', 'Gemumua-Agbobolo', 'Gemat-y', 'Gubang', 'Laguna', 'Lawaan', 'Libo-o', 'Man-it', 'Mantulang', 'Mayang', 'Poblacion Ilawod', 'Poblacion Ilaya', 'Punong', 'Salngan', 'Tagubong']
            },
            {
                name: 'Oton',
                barangays: ['Abilay Norte', 'Abilay Sur', 'Alegre', 'Batuan Ilaud', 'Batuan Ilaya', 'Bita-og', 'Botong', 'Bugang', 'Caboloan Norte', 'Caboloan Sur', 'Calam-isan', 'Calumpang', 'Mambog', 'Pajo', 'Poblacion Norte', 'Poblacion Sur', 'Polo Maestra Bita', 'Rizal', 'Salngan', 'San Antonio', 'San Nicolas', 'Santa Rita', 'Sapa', 'Tagbac', 'Trapiche']
            }
        ]
    },
    {
        name: 'Aklan',
        cities: [
            {
                name: 'Kalibo',
                barangays: ['Andagao', 'Bachaw Norte', 'Bachaw Sur', 'Brgy. 1', 'Brgy. 2', 'Brgy. 3', 'Brgy. 4', 'Brgy. 5', 'Brgy. 6', 'Brgy. 7', 'Brgy. 8', 'Linabuan Norte', 'Linabuan Sur', 'Mobo', 'Nalook', 'New Buswang', 'Poblacion', 'Pook', 'Tigayon', 'Tinigao']
            },
            {
                name: 'Boracay (Malay)',
                barangays: ['Argao', 'Balabag', 'Caticlan', 'Cogon', 'Manoc-Manoc', 'Motag', 'Naasug', 'Nabaoy', 'Napaan', 'Poblacion', 'Yapak']
            }
        ]
    },
    {
        name: 'Antique',
        cities: [
            {
                name: 'San Jose de Buenavista',
                barangays: ['Agbanban', 'Aras-asan', 'Badiang', 'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Barangay 9', 'Barangay 10', 'Barangay 11', 'Barangay 12', 'Calo', 'Dawis', 'Hinablan', 'Inabugnon', 'Mag-aba', 'Maranat', 'Mongpong', 'Nasuli', 'Paciencia', 'Pamandayan', 'Pandan', 'Pone Norte', 'Pone Sur', 'Poong', 'San Jose', 'Talisay']
            }
        ]
    },
    {
        name: 'Capiz',
        cities: [
            {
                name: 'Roxas City',
                barangays: ['Adlawan', 'Balijuagan', 'Baybay', 'Bolo', 'Cabugao', 'Cogon', 'Culajao', 'Dinginan', 'Dumolog', 'Gabu-an', 'Libas', 'Liko-an Estancia', 'Loctugan', 'Milibili', 'Olotayan', 'Poblacion Tabuc Norte', 'Poblacion Tabuc Sur', 'San Jose', 'Sibaguan', 'Tanza', 'Tiza']
            }
        ]
    },
    {
        name: 'Guimaras',
        cities: [
            {
                name: 'Jordan',
                barangays: ['Alaguisoc', 'Balcon Maravilla', 'Balcon Melliza', 'Bugnay', 'Constancia', 'El Retiro', 'Espinosa', 'Hoskyn', 'Lawi', 'Morobuan', 'Poblacion', 'Rizal', 'San Miguel', 'Santa Teresa', 'Tamborong']
            }
        ]
    },
    // REGION VII - CENTRAL VISAYAS
    {
        name: 'Bohol',
        cities: [
            {
                name: 'Tagbilaran City',
                barangays: ['Booy', 'Cabawan', 'Cogon', 'Dampas', 'Dao', 'Manga', 'Mansasa', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'San Isidro', 'Taloto', 'Tiptip', 'Ubujan']
            },
            {
                name: 'Panglao',
                barangays: ['Bil-isan', 'Bolod', 'Danao', 'Doljo', 'Libaong', 'Looc', 'Lourdes', 'Poblacion', 'Tangnan', 'Tawala']
            }
        ]
    },
    {
        name: 'Negros Oriental',
        cities: [
            {
                name: 'Dumaguete City',
                barangays: ['Bajumpandan', 'Bagacay', 'Balugo', 'Banilad', 'Bantayan', 'Batinguel', 'Bunao', 'Cadawinonan', 'Calindagan', 'Camanjac', 'Candau-ay', 'Cantil-e', 'Daro', 'Junob', 'Looc', 'Mangnao-Canal', 'Motong', 'Piapi', 'Poblacion No. 1', 'Poblacion No. 2', 'Poblacion No. 3', 'Poblacion No. 4', 'Poblacion No. 5', 'Poblacion No. 6', 'Poblacion No. 7', 'Poblacion No. 8', 'Pulantubig', 'Tabuctubig', 'Talay']
            },
            {
                name: 'Bayawan City',
                barangays: ['Ali-is', 'Banga', 'Boyco', 'Kal-anan', 'Malabugas', 'Maninihon', 'Nangka', 'Pagatban', 'Poblacion', 'Suba', 'Tayawan', 'Villareal']
            },
            {
                name: 'Bais City',
                barangays: ['Barangay I', 'Barangay II', 'Binobong', 'Cabanlutan', 'Calasga-an', 'Cambagahan', 'Dansulan', 'Hangyad', 'Mabunao', 'Okiot', 'Olympia', 'Panala-an', 'Rizal', 'Sab-ahan', 'Tanlad']
            },
            {
                name: 'Canlaon City',
                barangays: ['Bayog', 'Binalbagan', 'Budlasan', 'Linothangan', 'Lumapao', 'Mabigo', 'Malaiba', 'Masulog', 'Panubigan', 'Poblacion', 'Pula', 'Masulog']
            }
        ]
    },
    {
        name: 'Siquijor',
        cities: [
            {
                name: 'Siquijor',
                barangays: ['Caipilan', 'Cang-apa', 'Cang-atuyom', 'Canghunoghunog', 'Libo', 'Napo', 'Olang', 'Pisong', 'Poblacion', 'Ponong', 'Sandugan', 'Songas', 'Tacdog', 'Tambisan', 'Tubod']
            }
        ]
    },
    // REGION VIII - EASTERN VISAYAS
    {
        name: 'Leyte',
        cities: [
            {
                name: 'Tacloban City',
                barangays: ['Abucay', 'Barangay 1', 'Barangay 2', 'Barangay 37', 'Barangay 38', 'Barangay 50', 'Barangay 60', 'Barangay 88', 'Barangay 89', 'Barangay 90', 'Barangay 100', 'Cabalawan', 'Caibaan', 'Marasbaras', 'New Kawayan', 'Sagkahan', 'San Jose', 'Santo Niño', 'Suhi', 'V & G Subdivision']
            },
            {
                name: 'Ormoc City',
                barangays: ['Airport', 'Alta Vista', 'Bagong', 'Bantigue', 'Can-adieng', 'Cogon', 'Dolores', 'Gaas', 'Ipil', 'Liberty', 'Liloan', 'Mabini', 'Naungan', 'Poblacion', 'Valencia']
            }
        ]
    },
    {
        name: 'Samar',
        cities: [
            {
                name: 'Catbalogan',
                barangays: ['Arado', 'Basiao', 'Burabod', 'Canlapwas', 'Mancol', 'Mercedes', 'Payao', 'Poblacion', 'San Mateo', 'Talalora']
            }
        ]
    },
    // REGION IX - ZAMBOANGA PENINSULA
    {
        name: 'Zamboanga del Sur',
        cities: [
            {
                name: 'Pagadian City',
                barangays: ['Alegria', 'Balangasan', 'Baloyboan', 'Bomba', 'Bulatok', 'Danlugan', 'Dao', 'Gubat', 'Lala', 'Lumbia', 'Macasing', 'Muricay', 'Napolan', 'Palpalan', 'Poblacion', 'San Jose', 'San Pedro', 'Santa Lucia', 'Santa Maria', 'Santiago', 'Tawagan Sur', 'Tiguma', 'White Beach']
            },
            {
                name: 'Zamboanga City',
                barangays: ['Arena Blanco', 'Ayala', 'Baliwasan', 'Boalan', 'Bunguiao', 'Busay', 'Cabaluay', 'Cabatangan', 'Canelar', 'Culianan', 'Curuan', 'Dulian', 'Guiwan', 'Labuan', 'La Paz', 'Lanzones', 'Mampang', 'Manalipa', 'Manicahan', 'Mercedes', 'Pasonanca', 'Putik', 'Quiniput', 'Rio Hondo', 'San Roque', 'Santa Catalina', 'Santa Maria', 'Sinunuc', 'Talon-talon', 'Tetuan', 'Tictapul', 'Tigbalabag', 'Tulungatung', 'Zambowood']
            }
        ]
    },
    // REGION X - NORTHERN MINDANAO
    {
        name: 'Misamis Oriental',
        cities: [
            {
                name: 'Cagayan de Oro',
                barangays: ['Agusan', 'Balulang', 'Bayabas', 'Bayanga', 'Bonbon', 'Bugo', 'Bulua', 'Camaman-an', 'Carmen', 'Consolacion', 'Cugman', 'Gusa', 'Indahag', 'Iponan', 'Kauswagan', 'Lapasan', 'Lumbia', 'Macabalan', 'Macasandig', 'Nazareth', 'Patag', 'Poblacion', 'Puerto', 'San Simon', 'Tablon', 'Taglimao', 'Taguanao', 'Tignapoloan']
            }
        ]
    },
    {
        name: 'Bukidnon',
        cities: [
            {
                name: 'Malaybalay',
                barangays: ['Aglayan', 'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8', 'Bangcud', 'Busdi', 'Casisang', 'Dalwangan', 'Impalutao', 'Kalasungay', 'Managok', 'Patpat', 'San Jose', 'Santo Niño', 'Simaya', 'Violeta']
            },
            {
                name: 'Valencia',
                barangays: ['Bagontaas', 'Barobo', 'Batangan', 'Catumbalon', 'Colonia', 'Guinoyuran', 'Laligan', 'Lilingayon', 'Lourdes', 'Lumbo', 'Mailag', 'Maapag', 'Poblacion', 'San Carlos', 'San Isidro', 'Sinayawan', 'Sugod', 'Tongantongan', 'Tugaya']
            }
        ]
    },
    // REGION XI - DAVAO REGION
    {
        name: 'Davao del Norte',
        cities: [
            {
                name: 'Tagum City',
                barangays: ['Apokon', 'Bincungan', 'Busaon', 'Canocotan', 'Cuambogan', 'La Filipina', 'Liboganon', 'Madaum', 'Magdum', 'Mankilam', 'New Balamban', 'Nueva Fuerza', 'Pagsabangan', 'Pandapan', 'Poblacion', 'San Agustin', 'San Isidro', 'Visayan Village']
            },
            {
                name: 'Panabo City',
                barangays: ['A.O. Floirendo', 'Buenavista', 'Cacao', 'Cagangohan', 'Dapco', 'Datu Abdul Dadia', 'Gredu', 'J.P. Laurel', 'Kasilak', 'Katualan', 'Kauswagan', 'Kiotoy', 'Little Panay', 'Lower Panaga', 'Mabunao', 'Maduao', 'Malativas', 'Manay', 'Nanyo', 'New Pandan', 'New Visayas', 'Poblacion', 'Quezon', 'Salvacion', 'San Francisco', 'San Nicolas', 'San Pedro', 'San Roque', 'San Vicente', 'Santo Niño', 'Sindaton', 'Southern Davao', 'Tagpore', 'Tibungol', 'Upper Licanan', 'Waterfall']
            }
        ]
    },
    {
        name: 'Davao de Oro',
        cities: [
            {
                name: 'Nabunturan',
                barangays: ['Anislagan', 'Antequera', 'Basak', 'Bayabas', 'Cabacungan', 'Cabidianan', 'Katipunan', 'Libasan', 'Linda', 'Magading', 'Magsaysay', 'Mainit', 'Manat', 'Matilo', 'Ogao', 'Pangibiran', 'Poblacion', 'San Isidro', 'San Roque', 'San Vicente', 'Sasa', 'Tagnocon']
            }
        ]
    },
    // REGION XII - SOCCSKSARGEN
    {
        name: 'South Cotabato',
        cities: [
            {
                name: 'General Santos',
                barangays: ['Apopong', 'Baluan', 'Batomelong', 'Buayan', 'Bula', 'Calumpang', 'City Heights', 'Conel', 'Dadiangas East', 'Dadiangas North', 'Dadiangas South', 'Dadiangas West', 'Fatima', 'Katangawan', 'Lagao', 'Ligaya', 'Mabuhay', 'Olympog', 'San Isidro', 'San Jose', 'Sinawal', 'Tambler', 'Tinagacan', 'Upper Labay']
            },
            {
                name: 'Koronadal',
                barangays: ['Assumption', 'Avanceña', 'Cacub', 'Caloocan', 'Carpenter Hill', 'Concepcion', 'Esperanza', 'General Paulino Santos', 'Mabini', 'Magsaysay', 'Morales', 'Namnama', 'New Pangasinan', 'Paraiso', 'Poblacion', 'Rotonda', 'San Jose', 'San Roque', 'Santa Cruz', 'Saravia', 'Topland', 'Zone I', 'Zone II', 'Zone III', 'Zone IV']
            }
        ]
    },
    // REGION XIII - CARAGA
    {
        name: 'Agusan del Norte',
        cities: [
            {
                name: 'Butuan City',
                barangays: ['Agao', 'Agusan Pequeño', 'Ambago', 'Amparo', 'Ampayon', 'Anticala', 'Antongalon', 'Aupagan', 'Baan KM 3', 'Baan Riverside', 'Bading', 'Bancasi', 'Banza', 'Baobaoan', 'Basag', 'Bayanihan', 'Bilay', 'Bit-os', 'Bitan-agan', 'Bobon', 'Bonbon', 'Bugabus', 'Bugsukan', 'Buhangin', 'California', 'Dagohoy', 'Dankias', 'De Oro', 'Diego Silang', 'Don Francisco', 'Doongan', 'Dulag', 'Dumalagan', 'Florida', 'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas Pob.', 'Jose Rizal Pob.', 'Kinamlutan', 'Lapu-lapu Pob.', 'Lemon', 'Leon Kilat', 'Libertad', 'Limaha Pob.', 'Los Angeles', 'Lumbocan', 'Maguinda', 'Mahay', 'Mahogany', 'Maibu', 'Mandamo', 'Manila de Bugabus', 'Maon Pob.', 'Masao', 'Maug', 'New Society Village', 'Nong-nong', 'Ong Yiu', 'Pagatpatan', 'Pangabugan', 'Pianing', 'Pigdaulan', 'Pinamanculan', 'Port Poyohon', 'Rajah Soliman Pob.', 'San Ignacio Pob.', 'San Mateo', 'San Vicente', 'Sikatuna', 'Silongan Pob.', 'Sumilihon', 'Sumilao', 'Tagabaca', 'Taguibo', 'Taligaman', 'Tandang Sora Pob.', 'Tiniwisan', 'Tungao', 'Urduja Pob.', 'Villa Kananga']
            },
            {
                name: 'Cabadbaran',
                barangays: ['Antonio Luna', 'Bay-ang', 'Bayabas', 'Caasinan', 'Cabinet', 'Calamba', 'Calibunan', 'Centro', 'Comagascas', 'Concepcion', 'Del Pilar', 'Katugasan', 'Kauswagan', 'La Union', 'Mabini', 'Mahaba', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Poblacion 8', 'Poblacion 9', 'Poblacion 10', 'Poblacion 11', 'Poblacion 12', 'Sanghan', 'Soriano', 'Tolosa']
            }
        ]
    },
    {
        name: 'Surigao del Norte',
        cities: [
            {
                name: 'Surigao City',
                barangays: ['Alang-alang', 'Anomar', 'Aurora', 'Baybay', 'Bilabid', 'Bitaugan', 'Bonifacio', 'Buena Voluntad', 'Buenavista', 'Cabongbongan', 'Canlanipa', 'Cantiasay', 'Cawilan', 'Danao', 'Ipil', 'Libuac', 'Lipata', 'Luna', 'Mabini', 'Mabua', 'Mapawa', 'Mat-i', 'Nabago', 'Nonoc', 'Orok', 'Poctoy', 'Punta Bilar', 'Quezon', 'Rizal', 'Sabang', 'San Juan', 'San Pedro', 'Silop', 'Sukailang', 'Taft', 'Tagana-an', 'Togbongon', 'Trinidad', 'Washington']
            }
        ]
    },
    // CORDILLERA ADMINISTRATIVE REGION (CAR)
    {
        name: 'Benguet',
        cities: [
            {
                name: 'Baguio City',
                barangays: ['A. Bonifacio-Caguioa-Rimando', 'Abanao-Zandueta-Kayong-Chugum-Otek', 'Alfonso Tabora', 'Ambiong', 'Andres Bonifacio', 'Atok Trail', 'Aurora Hill Proper', 'Aurora Hill North Central', 'Aurora Hill South Central', 'Bagong Lipunan', 'Bakakeng Central', 'Bakakeng North', 'Bal-Marcoville', 'Balsigan', 'Bayan Park East', 'Bayan Park West', 'Brookside', 'Brookspoint', 'Cabinet Hill-Teacher Camp', 'Camdas Subdivision', 'Camp 7', 'Camp 8', 'Camp Allen', 'Campo Filipino', 'City Camp Central', 'City Camp Proper', 'Country Club Village', 'Cresencia Village', 'Dagsian Lower', 'Dagsian Upper', 'Dizon Subdivision', 'Dominican Hill-Mirador', 'Dontogan', 'DPS Area', 'Engineers Hill', 'Fairview Village', 'Ferdinand', 'Fort del Pilar', 'Gibraltar', 'Greenwater Village', 'Guisad Central', 'Guisad Sorong', 'Happy Hollow', 'Happy Homes', 'Harrison-Claudio Carantes', 'Hillside', 'Holy Ghost Extension', 'Holy Ghost Proper', 'Honeymoon', 'Imelda R. Marcos', 'Imelda Village', 'Irisan', 'Kabayanihan', 'Kagitingan', 'Kayang Extension', 'Kayang Hilltop', 'Kias', 'Legarda-Burnham-Kisad', 'Liwanag-Loakan', 'Loakan Proper', 'Lopez Jaena', 'Lourdes Subdivision Extension', 'Lourdes Subdivision Lower', 'Lourdes Subdivision Proper', 'Lualhati', 'Lucnab', 'Magsaysay Private Road', 'Magsaysay Lower', 'Magsaysay Upper', 'Malcolm Square-Perfecto', 'Manuel A. Roxas', 'Market Subdivision Upper', 'Middle Quezon Hill Subdivision', 'Military Cut-off', 'Mines View Park', 'Modern Site East', 'Modern Site West', 'MRR-Queen of Peace', 'New Lucban', 'Outlook Drive', 'Pacdal', 'Padre Burgos', 'Padre Zamora', 'Palma-Urbano', 'Phil-Am', 'Pinget', 'Pinsao Pilot Project', 'Pinsao Proper', 'Poliwes', 'Pucsusan', 'Quezon Hill Proper', 'Quezon Hill Upper', 'Quirino Hill East', 'Quirino Hill Lower', 'Quirino Hill Middle', 'Quirino Hill West', 'Quirino-Magsaysay Upper', 'Rizal Monument Area', 'Rock Quarry Lower', 'Rock Quarry Middle', 'Rock Quarry Upper', 'Saint Joseph Village', 'Salud Mitra', 'San Antonio Village', 'San Luis Village', 'San Roque Village', 'San Vicente', 'Sanitary Camp North', 'Sanitary Camp South', 'Santa Escolastica', 'Santo Rosario', 'Santo Tomas Proper', 'Santo Tomas School Area', 'Saratoga', 'Scaddan', 'Scouts Barrio', 'Session Road Area', 'Slaughter House Area', 'SLU-SVP Housing Village', 'South Drive', 'Teodora Alonzo', 'Trancoville', 'Upper Dagsian', 'Upper General Luna', 'Upper QM', 'Victoria Village']
            },
            {
                name: 'La Trinidad',
                barangays: ['Alno', 'Ambiong', 'Balili', 'Beckel', 'Bineng', 'Cruz', 'Lubas', 'Pico', 'Poblacion', 'Puguis', 'Shilan', 'Tawang', 'Wangal']
            }
        ]
    },
    // ILOCOS REGION
    {
        name: 'Ilocos Norte',
        cities: [
            {
                name: 'Laoag City',
                barangays: ['Araniw', 'Balatong', 'Barit-Pandan', 'Baruyen', 'Bengcag', 'Buttong', 'Cabungaan North', 'Cabungaan South', 'Calayab', 'Camangaan', 'Cataban', 'Cavit', 'Darayday', 'Dibua North', 'Dibua South', 'Gaang', 'Lagui-Sail', 'Lataag', 'Mangato East', 'Mangato West', 'Nanguyudan', 'Navotas', 'Pila', 'Raraburan', 'Rioeng', 'San Agustin', 'San Isidro', 'San Matias', 'San Mateo', 'San Nicolas', 'San Pedro', 'San Quirino', 'Santa Angela', 'Santa Balbina', 'Santa Cayetana', 'Santa Joaquina', 'Santa Rosa', 'Suyo', 'Talingaan', 'Tangid', 'Vira', 'Zamboanga']
            },
            {
                name: 'Batac City',
                barangays: ['Aglipay', 'Baay', 'Balbalayang', 'Baoa', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI', 'Barangay VII', 'Barangay VIII', 'Barangay IX', 'Barangay X', 'Ben-agan', 'Bil-loca', 'Biningan', 'Cangrunaan', 'Capacuan', 'Caunayan', 'Cayambanan', 'Dariwdiw', 'Lacub', 'Magnuang', 'Maipalig', 'Naguirangan', 'Palongpong', 'Palpalicong', 'Parangopong', 'Payao', 'Poblacion', 'Quiling Norte', 'Quiling Sur', 'Rayuray', 'Ricarte', 'San Julian', 'San Mateo', 'San Pedro', 'Santa Matilde', 'Sumader', 'Tabug']
            }
        ]
    },
    {
        name: 'Ilocos Sur',
        cities: [
            {
                name: 'Vigan City',
                barangays: ['I Ayusan Norte', 'II Ayusan Sur', 'III Barrio Camangaan', 'IV Nagsangalan', 'V Tamag', 'VI Pantay Laud', 'VII Pantay Fatima', 'VIII Pantay Daya', 'IX Pantay Quitiquit', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI', 'Barangay VII', 'Barangay VIII', 'Barangay IX', 'Barrio Capangpangan', 'Barrio Salindeg', 'Bongtolan', 'Bulala', 'Cabalangegan', 'Cabaroan Daya', 'Cabaroan Unggan', 'Camangaan', 'Pantay Daya', 'Pantay Fatima', 'Pantay Laud', 'Pantay Quitiquit', 'Paoa', 'Paratong', 'Pong-ol', 'Purok-a-bassit', 'Purok-a-dackel', 'Raois', 'Rugsuanan', 'Salindeg', 'San Jose', 'San Julian Norte', 'San Julian Sur', 'San Pedro', 'Santiago Norte', 'Santiago Sur', 'Tamag']
            },
            {
                name: 'Candon City',
                barangays: ['Allangigan', 'Amguid', 'Ayudante', 'Bagani Campo', 'Bagani Gabor', 'Bagani Tocgo', 'Bagani Ubbog', 'Balingaoan', 'Baro', 'Bugnay', 'Calaoaan', 'Calongbuyan', 'Caterman', 'Cubcubbuclao', 'Darapidap', 'Langlangca I', 'Langlangca II', 'Paras', 'Paypayad', 'Puspus', 'Salvador', 'San Agustin', 'San Andres', 'San Antonio', 'San Jose', 'San Juan', 'San Nicolas', 'San Pedro', 'Santa Cruz', 'Tablac', 'Talogtog', 'Tamurong', 'Villarica']
            }
        ]
    },
    {
        name: 'La Union',
        cities: [
            {
                name: 'San Fernando City',
                barangays: ['Abut', 'Apaleng', 'Bacsil', 'Bangbangolan', 'Baraoas', 'Biday', 'Birunget', 'Bungro', 'Cabaroan', 'Cabarsican', 'Cadaclan', 'Calabugao', 'Camansi', 'Canaoay', 'Carlatan', 'Catbangen', 'Dallangayan Este', 'Dallangayan Oeste', 'Langcuas', 'Lingsat', 'Madayegdeg', 'Mameltac', 'Masicong', 'Nagyubuyuban', 'Namtutan', 'Pacpaco', 'Pagdalagan', 'Pagudpud', 'Pao Norte', 'Pao Sur', 'Parian', 'Pias', 'Poro', 'Puspus', 'Sablut', 'Sacyud', 'Sagayad', 'San Agustin', 'San Francisco', 'San Vicente', 'Santiago Norte', 'Santiago Sur', 'Sayoan', 'Sevilla', 'Siboan-Otong', 'Tanqui']
            }
        ]
    },
    {
        name: 'Pangasinan',
        cities: [
            {
                name: 'Dagupan City',
                barangays: ['Bacayao Norte', 'Bacayao Sur', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Bolosan', 'Bonuan Binloc', 'Bonuan Boquig', 'Bonuan Gueset', 'Calmay', 'Carael', 'Caranglaan', 'Herrero', 'Lasip Chico', 'Lasip Grande', 'Lomboy', 'Lucao', 'Malued', 'Mamalingling', 'Mangin', 'Mayombo', 'Pantal', 'Poblacion Oeste', 'Pogo Chico', 'Pogo Grande', 'Pugaro Suit', 'Salapingao', 'Salisay', 'Tambac', 'Tapuac', 'Tebeng']
            },
            {
                name: 'San Carlos City',
                barangays: ['Agdao', 'Amagbagan', 'Anando', 'Antipangol', 'Balaya', 'Balayong', 'Baldog', 'Balite Sur', 'Bani', 'Bega', 'Bocboc', 'Bogaoan', 'Bolingit', 'Bolosan', 'Bonifacio', 'Buenglat', 'Burgos', 'Cacaritan', 'Caingal', 'Calobaoan', 'Calomboyan', 'Capataan', 'Caoayan-Kiling', 'Cobol', 'Coliling', 'Cruz', 'Doyong', 'Gamata', 'Guelew', 'Ilang', 'Inerangan', 'Isla', 'Libas', 'Lilimasan', 'Longos', 'Lucban', 'Luyang', 'Mabini', 'Mabalbalino', 'Magtaking', 'Malacañang', 'Maliwara', 'Mamarlao', 'Matagdem', 'Mestizo Norte', 'Naguilayan', 'Nilombot', 'Padilla', 'Pagal', 'Palaming', 'Palaris', 'Palospos', 'Pangalangan', 'Pangoloan', 'Pangpang', 'Paitan-Panoypoy', 'Parayao', 'Payapa', 'Payar', 'Perez Blvd.', 'Polo', 'Quezon Blvd.', 'Quintong', 'Rizal', 'Roxas Blvd.', 'Salinap', 'San Juan', 'San Pedro-Taloy', 'San Pedro Apartado', 'San Rafael', 'Sapinit', 'Saracat', 'Supo', 'Talang', 'Tamayo', 'Tandang Sora', 'Tarece', 'Tarectec', 'Tayambani', 'Tebag', 'Turac']
            },
            {
                name: 'Alaminos City',
                barangays: ['Alos', 'Amandiego', 'Amangbangan', 'Balangobong', 'Balayang', 'Bisocol', 'Bolaney', 'Bued', 'Cabatuan', 'Cayucay', 'Dulacac', 'Inerangan', 'Landoc', 'Linmansangan', 'Lucap', 'Maawi', 'Macatiw', 'Magsaysay', 'Mona', 'Palamis', 'Pandan', 'Pangapisan', 'Poblacion', 'Pocalpocal', 'Pogo', 'Polo', 'Quibuar', 'Sabangan', 'San Antonio', 'San Jose', 'San Roque', 'San Vicente', 'Santa Maria', 'Tanaytay', 'Tangcarang', 'Tawintawin', 'Telbang', 'Victoria']
            },
            {
                name: 'Urdaneta City',
                barangays: ['Anonas', 'Bactad East', 'Bayaoas', 'Bolaoen', 'Cabaruan', 'Cabuloan', 'Camanang', 'Camantiles', 'Casantaan', 'Catablan', 'Cayambanan', 'Consolacion', 'Dilan-Paurido', 'Dr. Pedro T. Orata', 'Labit Proper', 'Labit West', 'Mabanogbog', 'Macalong', 'Nancalobasaan', 'Nancamaliran East', 'Nancamaliran West', 'Nancayasan', 'Oltama', 'Palina East', 'Palina West', 'Panaga', 'Pedro T. Orata', 'Pinmaludpod', 'Poblacion', 'San Jose', 'San Vicente', 'Santa Lucia', 'Santo Domingo', 'Sugcong', 'Tikitik', 'Tulong']
            }
        ]
    }
];

// Helper functions
export const getProvinces = (): string[] => {
    return philippineLocations.map(p => p.name);
};

export const getCitiesByProvince = (provinceName: string): string[] => {
    const province = philippineLocations.find(p => p.name === provinceName);
    return province ? province.cities.map(c => c.name) : [];
};

export const getBarangaysByCity = (provinceName: string, cityName: string): string[] => {
    const province = philippineLocations.find(p => p.name === provinceName);
    if (!province) return [];
    
    const city = province.cities.find(c => c.name === cityName);
    return city ? city.barangays : [];
};
