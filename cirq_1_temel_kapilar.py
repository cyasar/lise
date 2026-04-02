import cirq

def main():
    print("="*50)
    print("    1. CİRQ İLE TEMEL KUANTUM KAPILARI    ")
    print("="*50)
    print("Google'ın Kuantum kütüphanesi olan Cirq'e hoş geldiniz!\n")
    
    # 3 tane Kuantum Teli (Qubit) oluştur (Grid üzerinde yer belirliyoruz)
    q0 = cirq.GridQubit(0, 0)
    q1 = cirq.GridQubit(0, 1)
    q2 = cirq.GridQubit(0, 2)
    
    # Boş bir Kuantum Devresi başlat
    circuit = cirq.Circuit()
    
    # Pauli-X (NOT) Kapısı (0'ı 1, 1'i 0 yapar)
    circuit.append(cirq.X(q0))
    
    # Hadamard (Süperpozisyon) Kapısı (Olasılığı %50 %50 ikiye böler)
    circuit.append(cirq.H(q1))
    
    # Pauli-Y Kapısı (Fazı kompleks eksende çevirir)
    circuit.append(cirq.Y(q2))
    
    print("Oluşturulan Kuantum Devresi Şeması:\n")
    print(circuit)
    
    print("\nNOT: Cirq kütüphanesi şemaları son derece sade bir yapıda çizer.")
    print("Çalıştırmak isterseniz projeye Simulator modülünü eklemeniz gerekir.")

if __name__ == "__main__":
    main()
