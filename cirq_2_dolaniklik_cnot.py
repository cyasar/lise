import cirq

def main():
    print("="*50)
    print("    2. KUANTUM DOLANIKLIK (BELL DURUMU)    ")
    print("="*50)
    print("Evrendeki en ilginç olay: Kuantum Dolanıklık!")
    print("Ne kadar uzağa koyarsanız koyun, 2 parçacık telepatik bir bağ kurar.\n")
    
    # 2 Qubit oluştur (Line üzerinde 0 ve 1)
    q0, q1 = cirq.LineQubit.range(2)
    circuit = cirq.Circuit()
    
    # Önce 1. qubiti süperpozisyona (Yarı ölü yarı diri) sokalım
    circuit.append(cirq.H(q0))
    
    # Sonra CNOT (Kontrollü-NOT) ile bu iki qubiti birbirine dolaşık yapalım!
    # Eğer q0 -> 1 ise, q1'i de zorla 1 yap. (Sıkı sıkıya bağlandılar)
    circuit.append(cirq.CNOT(q0, q1))
    
    # Parçacıkların bağlandığını ispatlamak için iki kutuyu da ölçüyoruz:
    circuit.append(cirq.measure(q0, q1, key='olcum'))
    
    print("Oluşturulan Dolanıklık Devresi:\n")
    print(circuit)
    
    # Arka planda fiziki bir bilgisayar çalıştırıyor gibi simülatör açıyoruz
    simulator = cirq.Simulator()
    print("\nSimülasyon çalıştırılıyor (Deney 10 kez art arda yapılıyor)...")
    
    # 10 kez zarları (parçacıkları) test et
    sonuc = simulator.run(circuit, repetitions=10)
    
    print(f"\n10 Deneyin Çıktısı:\n{sonuc}")
    print("\nFARK ETTİNİZ Mİ?")
    print("Eğer Qubit-1 sıfır çıkarsa, Qubit-2'de her zaman Sıfır çıktı!")
    print("Biri yazıyken diğeri tura ASLA çıkmadı! Parçacıklar birbiriyle konuşuyor.")

if __name__ == "__main__":
    main()
