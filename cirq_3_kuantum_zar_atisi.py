import cirq

def main():
    print("="*50)
    print(" 3. KUSURSUZ RASTGELE SAYI ÜRETİCİ (ZAR ATMA) ")
    print("="*50)
    print("Klasik bilgisayarlar asla 'gerçek' bir rastgele sayı üretemez, sadece taklit eder.")
    print("Fakat kuantum bilgisayarlar süperpozisyon çökmesiyle Evrenin en kusursuz zarını atarlar!\n")
    
    # 1 adet Qubit (Parçacık) yeterli
    q = cirq.NamedQubit("Kuantum_Zari")
    circuit = cirq.Circuit()
    
    # Parçacığı %50 Tura (1) | %50 Yazı (0) olasılığında havaya fırlat
    circuit.append(cirq.H(q))
    
    # Yere düştüğünde kutuyu aç ve sonucu gözlemleyerek çökelt
    circuit.append(cirq.measure(q, key='zar_sonucu'))
    
    print("Havaya Fırlatma Devresi:\n")
    print(circuit)
    
    simulator = cirq.Simulator()
    print("\nZar arka arkaya tam 30 kez havaya atılıp yere düşürüldü:")
    res = simulator.run(circuit, repetitions=30)
    
    # Çıkan ölçümleri listeye aktaralım
    sonuclar = res.measurements['zar_sonucu'].flatten()
    print(f"\nÇıkan 30 Sonuç:\n{sonuclar}")
    
    yazi_sayisi = sum(1 for x in sonuclar if x == 0)
    tura_sayisi = sum(1 for x in sonuclar if x == 1)
    
    print(f"\nİSTATİSTİK:")
    print(f"Bozuk para {yazi_sayisi} kez (0) Yazı, {tura_sayisi} kez (1) Tura geldi!")
    print("Bu sonucun bir formülü veya deseni yoktur, evrensel mutlak bir rastgeleliktir.")

if __name__ == "__main__":
    main()
