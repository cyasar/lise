from qiskit import QuantumCircuit
import matplotlib.pyplot as plt

def main():
    print("="*50)
    print("    TEMEL KUANTUM KAPILARI (X, Y, Z, T) DEVRESİ    ")
    print("="*50)
    
    # Toplam 4 farklı Qubit (kuantum teli) içeren bir devre başlatıyoruz.
    # q0: X kapısı için, q1: Y kapısı için, q2: Z kapısı için, q3: T kapısı için
    qc = QuantumCircuit(4)
    
    # ----------------------------------------------------
    # 1. PAULI-X KAPISI (Kuantum NOT Kapısı)
    # Bloch küresinde oku X ekseni etrafında 180 derece döndürür.
    # |0⟩ durumunu |1⟩ durumuna, |1⟩ durumunu |0⟩ durumuna çevirir.
    qc.x(0)
    # ----------------------------------------------------
    
    # Görsel olarak kapıları birbirinden ayırmak için 'barrier' koyuyoruz
    qc.barrier()

    # ----------------------------------------------------
    # 2. PAULI-Y KAPISI 
    # Oku hem tersine çevirir hem de sanal (kompleks) bir faz ekler.
    qc.y(1)
    # ----------------------------------------------------
    qc.barrier()

    # ----------------------------------------------------
    # 3. PAULI-Z KAPISI (Faz Çevirici)
    # Oku Z ekseni etrafında 180 derece döndürür. 
    # |0⟩ hiç etkilenmez, |1⟩ durumunda vektör yönü eksiye (-) döner.
    qc.z(2)
    # ----------------------------------------------------
    qc.barrier()

    # ----------------------------------------------------
    # 4. T KAPISI (Pi/4 Dönüşü)
    # Z kapısının çok daha küçük açılı versiyonudur (Tam çeyrek faz çevirir).
    qc.t(3)
    # ----------------------------------------------------


    # --- ÇIKTILARI GÖSTERME AŞAMASI ---

    # 1) Önce siyah ekranda (Terminal'de) basit ASCII sanatıyla göster:
    print("\n[ TERNİNAL ÇIKTISI (ASCII ART) ]")
    print("Devre şeması aşağıdadır:\n")
    print(qc.draw(output='text'))
    print("\n" + "="*50)
    
    # 2) Sonra profesyonel olarak Matplotlib grafik penceresinde çizdir:
    try:
        print("\nGrafiksel devre penceresi açılıyor... Lütfen alt taraftaki/arkadaki pencereleri kontrol edin.")
        # 'mpl' komutu matplotlib ile renkli ve kaliteli grafik çizilmesini sağlar
        fig = qc.draw(output='mpl')
        # Başlık ekleme
        fig.suptitle("Temel Kuantum Kapilari (X, Y, Z, T)", fontsize=16)
        plt.show()
    except Exception as e:
        print(f"\nGörsel pencere açılamadı. Hata: {e}")
        print("Lütfen Terminal'e şu komutu yazarak gereksinimleri kurun: pip install qiskit pylatexenc matplotlib")

if __name__ == "__main__":
    main()
