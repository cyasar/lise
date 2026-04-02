# 🌌 Lise Öğrencileri İçin Kuantum Programlama Simülasyonu

Bu proje, lise düzeyindeki öğrencilere **Kuantum Programlama** mantığını, klasik bilgisayar yapıtaşlarından farklılıklarını ve **süperpozisyon**, **dolanıklık** gibi temel kuantum fiziği konseptlerini öğretmek üzere QTürkiye Kuantum Programlama Eğitmeni **Dr. Cumali Yaşar** tarafından hazırlanmış kapsamlı ve etkileşimli bir eğitim laboratuvarıdır.

## ✨ Projenin Amacı ve Kapsamı
Klasik (Kartezyen) veri büyümesiyle, Kuantum (Tensörel) veri büyümesi arasındaki inanılmaz farkları göstermek, kuantum algoritmalarının nasıl paralellik sağladığını 3 Boyutlu simülasyonlar (WebGL) kullanarak öğrencilere sevdirmektir. Öğrenciler herhangi bir program indirmeye gerek duymadan bir web tarayıcısı üzerinden kuantum zarlarını atabilir, vektör uzaylarını fareleriyle döndürüp keşfedebilirler.

## 📂 Proje İçeriği (Ne, Nerede?)

### 1- Web Tabanlı 3D Etkileşimli Simülasyon (Ana Ekran)
* **`index.html`**, **`styles.css`** ve **`script.js`**: Bu üç dosya bir araya gelerek projenin kalbini oluşturur. Sadece `index.html` dosyasına çift tıklayarak bu muazzam dünyayı tarayıcınızda açabilirsiniz.
    * Klasik Bit vs Kuantum Bit karşılaştırması.
    * 3D Bloch Küresi (Mouse ile çevrilebilir).
    * Canlı çalışan interaktif Python kod editörü ve kaydırma çubukları (Çift yönlü senkronizasyon).
    * Canlı matematik denklemi motoru (HTML ile özel).

### 2- Python (Console) İle Kuantum Örnekleri
Projeyi inceleyen öğrencilerin yerel (lokal) bilgisayarlarında test yapabilmeleri için saf Python kütüphaneleri kullanılarak hazırlanmış çalıştırılabilir örneklerdir:
* **`kuantum_devre_kapilari.py`**: **IBM Qiskit** kullanılarak yazılmış 4 temel kapı (X, Y, Z, T) şeması deneyi.
* **`cirq_1_temel_kapilar.py`**: **Google Cirq** kütüphanesi ile yazılmış temel kuantum kapıları.
* **`cirq_2_dolaniklik_cnot.py`**: Kuantum Dolanıklığı (Einstein'ın Hayalet Etkisi) ve CNOT kapısını anlatan dev deney.
* **`cirq_3_kuantum_zar_atisi.py`**: Hadamard kapısıyla %50 olasılık dalgası yaratıp evrendeki en kusursuz rastgeleliğe ulaşma deneyi.
* **`cirq_4_kuantum_teleportasyon.py`**: Bir kuantum bilgisinin dolanıklık ile başka bir boyuta ışınlanma (Teleportation) algoritması.

### 3- Etkileşimli Eğitim Defteri (Jupyter Notebook)
* **`Kuantum_Programlama_Egitimi.ipynb`**: Lise seminerinde çocukların eşzamanlı olarak açıp bizzat okuyacakları teorik metinlerin ve "Shift + Enter" ile saniye saniye yürütebilecekleri interaktif Python kod bloklarının bulunduğu ders kitabıdır.

## 🛠️ Kurulum / Gereksinimler

**A) Web Simülasyonu için:**
Hiçbir programa ihtiyaç yoktur. Sadece klasördeki `index.html` dosyasına çift tıklayıp herhangi bir güncel tarayıcıda (Chrome, Edge vb.) açmanız yeterlidir. (Three.js ve diğer modern kütüphaneler CDN üzerinden otomatik yüklenmektedir).

**B) Python ve Jupyter Notebook Dosyaları İçin:**
Eğer yerel bilgisayarınızda (VSCode vb.) Python dosyalarını çalıştıracaksanız, terminalinize kodları işleyecek şu iki dev kütüphaneyi kurmanız gerekir:
```bash
pip install qiskit
pip install cirq
pip install pylatexenc matplotlib jupyter
```

## 🔗 Ekstra Bağlantılar ve Önerilen Laboratuvarlar
Öğrencilerin sürükle-bırak yöntemle kuantum programlama deneyimi yaşaması için HTML dosyasının en altına dünyanın en çok kullanılan iki fizik motoru eklenmiştir:
1. **[Quirk Kuantum Simülatörü](https://algassert.com/quirk)** 
2. **[Quantum Länd (Circuit Designer)](https://thequantumlaend.de/quantum-circuit-designer/)**

---

**👨‍🏫 Geliştirici & Eğitmen:**
Dr. Cumali Yaşar - *QTürkiye Kuantum Programlama Eğitmeni*
Çanakkale Onsekiz Mart Üniversitesi Enformatik Bölümü
📧 *iletisim:* cumali.yasar@gmail.com | cyasar@comu.edu.tr
🌐 *YÖK Akademik:* [Profil Görüntüle](https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&authorId=CE71439DB25BFC5E)
💼 *LinkedIn:* [cyasar46](https://www.linkedin.com/in/cyasar46/)
