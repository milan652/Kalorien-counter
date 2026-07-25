import React, { useState, useRef } from 'react';
import { AiScanResult, MealType, IngredientItem } from '../types';
import { compressImage } from '../utils/image';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  X, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Plus,
  Trash2,
  Calculator,
  ListPlus
} from 'lucide-react';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (mealData: {
    name: string;
    mealType: MealType;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sugarG?: number;
    fiberG: number;
    portionSize: string;
    portionGrams?: number;
    unit?: 'g' | 'ml';
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
    sugarPer100g?: number;
    fiberPer100g?: number;
    imageUrl?: string;
    isAiScanned: boolean;
    ingredients?: IngredientItem[];
  }) => void;
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  onAddMeal
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AiScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable Form State after Scan
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [basePortionGrams, setBasePortionGrams] = useState<number>(300);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [portionGrams, setPortionGrams] = useState<number | ''>(300);
  const [unit, setUnit] = useState<'g' | 'ml'>('g');

  // Per 100g / 100ml values
  const [caloriesPer100g, setCaloriesPer100g] = useState<number | ''>(120);
  const [proteinPer100g, setProteinPer100g] = useState<number | ''>(8);
  const [carbsPer100g, setCarbsPer100g] = useState<number | ''>(15);
  const [fatPer100g, setFatPer100g] = useState<number | ''>(4);
  const [sugarPer100g, setSugarPer100g] = useState<number | ''>(5);
  const [fiberPer100g, setFiberPer100g] = useState<number | ''>(2);

  // Total portion values
  const [calories, setCalories] = useState<number>(360);
  const [proteinG, setProteinG] = useState<number>(24);
  const [carbsG, setCarbsG] = useState<number>(45);
  const [fatG, setFatG] = useState<number>(12);
  const [sugarG, setSugarG] = useState<number>(15);
  const [fiberG, setFiberG] = useState<number>(6);
  const [portionSize, setPortionSize] = useState<string>('300 g');

  // Ingredients List State
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState<number | ''>(100);
  const [newIngCal, setNewIngCal] = useState<number | ''>(120);
  const [newIngProt, setNewIngProt] = useState<number | ''>(10);
  const [newIngCarbs, setNewIngCarbs] = useState<number | ''>(10);
  const [newIngFat, setNewIngFat] = useState<number | ''>(3);
  const [showAddIngredientForm, setShowAddIngredientForm] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Bitte wähle ein gültiges Bild aus (JPG/PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawUrl = reader.result as string;
      try {
        const compressed = await compressImage(rawUrl, 500, 500, 0.6);
        setSelectedImage(compressed);
      } catch {
        setSelectedImage(rawUrl);
      }
      setError(null);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunScan = async (correctionOverride?: string | React.SyntheticEvent) => {
    if (!selectedImage) return;

    const correctionParam = typeof correctionOverride === 'string' ? correctionOverride.trim() : undefined;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          hint: hint.trim(),
          correction: correctionParam,
          currentResult: scanResult ? {
            foodName,
            calories,
            proteinG,
            carbsG,
            fatG,
            fiberG,
            portionSize
          } : undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Fehler beim KI-Scan.');
      }

      const result: AiScanResult = await response.json();
      setScanResult(result);

      // Determine portion grams and unit
      const pGrams = result.portionGrams || (result.portionSize ? parseInt(result.portionSize) : 300) || 300;
      const pUnit = result.unit || (result.portionSize?.toLowerCase().includes('ml') ? 'ml' : 'g');
      
      const cal100 = typeof result.caloriesPer100g === 'number' 
        ? result.caloriesPer100g 
        : (pGrams > 0 ? Math.round((result.calories / pGrams) * 100) : result.calories);
      
      const prot100 = typeof result.proteinPer100g === 'number' 
        ? result.proteinPer100g 
        : (pGrams > 0 ? Math.round((result.proteinG / pGrams) * 100 * 10) / 10 : result.proteinG);
      
      const carbs100 = typeof result.carbsPer100g === 'number' 
        ? result.carbsPer100g 
        : (pGrams > 0 ? Math.round((result.carbsG / pGrams) * 100 * 10) / 10 : result.carbsG);
      
      const fat100 = typeof result.fatPer100g === 'number' 
        ? result.fatPer100g 
        : (pGrams > 0 ? Math.round((result.fatG / pGrams) * 100 * 10) / 10 : result.fatG);
      
      const fiber100 = typeof result.fiberPer100g === 'number' 
        ? result.fiberPer100g 
        : (pGrams > 0 ? Math.round((result.fiberG / pGrams) * 100 * 10) / 10 : result.fiberG);

      setFoodName(result.foodName || 'Gescannte Mahlzeit');
      setBasePortionGrams(pGrams);
      setPortionMultiplier(1);
      setPortionGrams(pGrams);
      setUnit(pUnit as 'g' | 'ml');
      setCaloriesPer100g(cal100);
      setProteinPer100g(prot100);
      setCarbsPer100g(carbs100);
      setFatPer100g(fat100);
      setFiberPer100g(fiber100);

      // Calculate exact total for this weight
      const totCal = result.calories || Math.round((cal100 * pGrams) / 100);
      const totProt = result.proteinG || Math.round((prot100 * pGrams) / 100 * 10) / 10;
      const totCarbs = result.carbsG || Math.round((carbs100 * pGrams) / 100 * 10) / 10;
      const totFat = result.fatG || Math.round((fat100 * pGrams) / 100 * 10) / 10;
      const totFiber = result.fiberG || Math.round((fiber100 * pGrams) / 100 * 10) / 10;

      setCalories(totCal);
      setProteinG(totProt);
      setCarbsG(totCarbs);
      setFatG(totFat);
      setFiberG(totFiber);
      setPortionSize(`${pGrams} ${pUnit}`);

      if (result.ingredients && Array.isArray(result.ingredients) && result.ingredients.length > 0) {
        setIngredients(result.ingredients.map((ing, i) => ({
          id: `ing-${Date.now()}-${i}`,
          name: ing.name,
          amount: ing.amount || 100,
          unit: (ing.unit === 'ml' ? 'ml' : 'g') as 'g' | 'ml',
          calories: ing.calories || 0,
          proteinG: ing.proteinG || 0,
          carbsG: ing.carbsG || 0,
          fatG: ing.fatG || 0
        })));
      } else {
        setIngredients([]);
      }

      if (correctionOverride) {
        setCorrectionText('');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Das Bild konnte nicht analysiert werden.');
    } finally {
      setIsScanning(false);
    }
  };

  // Helper function to recalculate totals whenever portion weight or 100g values change
  const recalculateTotalsFrom100g = (
    newGrams: number | '',
    c100: number | '',
    p100: number | '',
    cb100: number | '',
    f100: number | '',
    fb100: number | '',
    currIngredients: IngredientItem[] = ingredients
  ) => {
    // If ingredients exist, use their sum as primary accuracy benchmark
    if (currIngredients.length > 0) {
      const sumCal = currIngredients.reduce((s, i) => s + (i.calories || 0), 0);
      const sumProt = Math.round(currIngredients.reduce((s, i) => s + (i.proteinG || 0), 0) * 10) / 10;
      const sumCarbs = Math.round(currIngredients.reduce((s, i) => s + (i.carbsG || 0), 0) * 10) / 10;
      const sumFat = Math.round(currIngredients.reduce((s, i) => s + (i.fatG || 0), 0) * 10) / 10;
      const sumGrams = currIngredients.reduce((s, i) => s + (i.amount || 0), 0);

      setCalories(sumCal);
      setProteinG(sumProt);
      setCarbsG(sumCarbs);
      setFatG(sumFat);
      if (sumGrams > 0) {
        setPortionGrams(sumGrams);
        setCaloriesPer100g(Math.round((sumCal / sumGrams) * 100));
        setProteinPer100g(Math.round((sumProt / sumGrams) * 100 * 10) / 10);
        setCarbsPer100g(Math.round((sumCarbs / sumGrams) * 100 * 10) / 10);
        setFatPer100g(Math.round((sumFat / sumGrams) * 100 * 10) / 10);
      }
      return;
    }

    const gramsNum = typeof newGrams === 'number' ? newGrams : 0;
    const c100Num = typeof c100 === 'number' ? c100 : 0;
    const p100Num = typeof p100 === 'number' ? p100 : 0;
    const cb100Num = typeof cb100 === 'number' ? cb100 : 0;
    const f100Num = typeof f100 === 'number' ? f100 : 0;
    const fb100Num = typeof fb100 === 'number' ? fb100 : 0;

    const factor = gramsNum / 100;
    setCalories(Math.max(0, Math.round(c100Num * factor)));
    setProteinG(Math.max(0, Math.round(p100Num * factor * 10) / 10));
    setCarbsG(Math.max(0, Math.round(cb100Num * factor * 10) / 10));
    setFatG(Math.max(0, Math.round(f100Num * factor * 10) / 10));
    setFiberG(Math.max(0, Math.round(fb100Num * factor * 10) / 10));
  };

  const handlePortionMultiplierChange = (multiplier: number) => {
    setPortionMultiplier(multiplier);
    const calculatedGrams = Math.round(basePortionGrams * multiplier);
    setPortionGrams(calculatedGrams);
    setPortionSize(`${calculatedGrams} ${unit}`);
    recalculateTotalsFrom100g(calculatedGrams, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g);
  };

  const handlePortionGramsChange = (rawVal: string) => {
    if (rawVal === '') {
      setPortionGrams('');
      setPortionSize(`0 ${unit}`);
      recalculateTotalsFrom100g('', caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g);
    } else {
      const num = Math.max(0, Number(rawVal));
      setPortionGrams(num);
      setPortionSize(`${num} ${unit}`);
      if (basePortionGrams > 0) {
        setPortionMultiplier(Math.round((num / basePortionGrams) * 100) / 100);
      }
      recalculateTotalsFrom100g(num, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g);
    }
  };

  const handleUnitChange = (newUnit: 'g' | 'ml') => {
    setUnit(newUnit);
    const pVal = portionGrams === '' ? 0 : portionGrams;
    setPortionSize(`${pVal} ${newUnit}`);
  };

  const handlePer100gChange = (field: 'cal' | 'prot' | 'carbs' | 'fat' | 'fiber', rawVal: string) => {
    const val: number | '' = rawVal === '' ? '' : Math.max(0, Number(rawVal));

    let c100 = caloriesPer100g;
    let p100 = proteinPer100g;
    let cb100 = carbsPer100g;
    let f100 = fatPer100g;
    let fb100 = fiberPer100g;

    if (field === 'cal') { c100 = val; setCaloriesPer100g(val); }
    if (field === 'prot') { p100 = val; setProteinPer100g(val); }
    if (field === 'carbs') { cb100 = val; setCarbsPer100g(val); }
    if (field === 'fat') { f100 = val; setFatPer100g(val); }
    if (field === 'fiber') { fb100 = val; setFiberPer100g(val); }

    recalculateTotalsFrom100g(portionGrams, c100, p100, cb100, f100, fb100);
  };

  const handleAddIngredient = () => {
    if (!newIngName.trim()) return;

    const newItem: IngredientItem = {
      id: `ing-${Date.now()}`,
      name: newIngName.trim(),
      amount: typeof newIngAmount === 'number' ? newIngAmount : 100,
      unit,
      calories: typeof newIngCal === 'number' ? newIngCal : 0,
      proteinG: typeof newIngProt === 'number' ? newIngProt : 0,
      carbsG: typeof newIngCarbs === 'number' ? newIngCarbs : 0,
      fatG: typeof newIngFat === 'number' ? newIngFat : 0
    };

    const updated = [...ingredients, newItem];
    setIngredients(updated);
    
    // Clear subform
    setNewIngName('');
    setNewIngAmount(100);
    setNewIngCal(120);
    setNewIngProt(10);
    setNewIngCarbs(10);
    setNewIngFat(3);
    setShowAddIngredientForm(false);

    recalculateTotalsFrom100g(portionGrams, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g, updated);
  };

  const handleDeleteIngredient = (id: string) => {
    const updated = ingredients.filter(i => i.id !== id);
    setIngredients(updated);
    recalculateTotalsFrom100g(portionGrams, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, fiberPer100g, updated);
  };

  const handleSaveMeal = () => {
    if (!foodName) return;

    const finalGrams = typeof portionGrams === 'number' ? portionGrams : 0;
    const finalCal100 = typeof caloriesPer100g === 'number' ? caloriesPer100g : 0;
    const finalProt100 = typeof proteinPer100g === 'number' ? proteinPer100g : 0;
    const finalCarbs100 = typeof carbsPer100g === 'number' ? carbsPer100g : 0;
    const finalFat100 = typeof fatPer100g === 'number' ? fatPer100g : 0;
    const finalFiber100 = typeof fiberPer100g === 'number' ? fiberPer100g : 0;

    onAddMeal({
      name: foodName,
      mealType,
      calories: Number(calories) || 0,
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
      fiberG: Number(fiberG) || 0,
      portionSize: `${finalGrams} ${unit} (${portionMultiplier} Portion)`,
      portionGrams: finalGrams,
      unit,
      caloriesPer100g: finalCal100,
      proteinPer100g: finalProt100,
      carbsPer100g: finalCarbs100,
      fatPer100g: finalFat100,
      fiberPer100g: finalFiber100,
      imageUrl: selectedImage || undefined,
      isAiScanned: true,
      ingredients: ingredients.length > 0 ? ingredients : undefined
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setHint('');
    setCorrectionText('');
    setScanResult(null);
    setIngredients([]);
    setError(null);
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen w-screen overflow-y-auto">
      {/* Full Screen Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Camera className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">KI Essensscanner</h3>
            <p className="text-xs text-slate-500">Fotografiere dein Essen zur automatischen Kalorienanalyse</p>
          </div>
        </div>
        <button 
          onClick={() => { handleReset(); onClose(); }}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Schließen"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Fullscreen Body */}
      <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-5">

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Image Selection */}
        {!selectedImage && (
          <div className="space-y-4 pt-4">
            <div 
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 mx-auto flex items-center justify-center">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Foto oder Bild hochladen</p>
                <p className="text-xs text-slate-500 mt-1">Ziehe eine Datei hierher oder tippe zum Auswählen</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Aus Galerie wählen</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Kamera öffnen</span>
              </button>
            </div>

            {/* Gallery Input */}
            <input 
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Camera Input */}
            <input 
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* STEP 2: Preview & Scanning */}
        {selectedImage && !scanResult && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Mahlzeit Vorschau" 
                className="max-h-80 object-contain"
              />
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-xl hover:bg-slate-900 transition-colors text-xs flex items-center gap-1.5 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Anderes Bild</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optionaler Hinweis zur Zubereitung / Menge
              </label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="z.B. 1 EL Olivenöl verwendet, ca. 250g Reis"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            <button
              type="button"
              onClick={() => handleRunScan()}
              disabled={isScanning}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>KI analysiert Nährwerte...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Jetzt mit KI analysieren</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: Scan Results & Editable Fields */}
        {scanResult && (
          <div className="space-y-4">
            
            {/* KI Confidence Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mahlzeit erfolgreich erkannt!</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {scanResult.description}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md">
                Genauigkeit: {scanResult.confidence}
              </span>
            </div>

            {scanResult.healthTip && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{scanResult.healthTip}</span>
              </div>
            )}

            {/* AI Refinement / Correction Input */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Korrektur oder Änderung zur Analyse angeben</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="z.B. 'Nur die Hälfte gegessen', 'Ohne Soße', 'Pute statt Hähnchen'"
                  className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && correctionText.trim() && !isScanning) {
                      e.preventDefault();
                      handleRunScan(correctionText.trim());
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => correctionText.trim() && handleRunScan(correctionText.trim())}
                  disabled={isScanning || !correctionText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isScanning ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Anpassen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editable Fields Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name der Speise</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mahlzeit-Kategorie</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white text-slate-900"
                  >
                    <option value="breakfast">Frühstück</option>
                    <option value="lunch">Mittagessen</option>
                    <option value="dinner">Abendessen</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Strictly Grams / Milliliters Portion Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Menge ({unit === 'g' ? 'in Gramm' : 'in Milliliter'})
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      min={1}
                      value={portionGrams}
                      onChange={(e) => handlePortionGramsChange(e.target.value)}
                      className="w-full min-w-0 flex-1 px-3.5 py-2 text-xs font-bold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
                    />
                    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUnitChange('g')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                          unit === 'g' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        g
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange('ml')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                          unit === 'ml' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ml
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Zutaten (Ingredients) Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ListPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zutaten & Einzelkomponenten ({ingredients.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddIngredientForm(!showAddIngredientForm)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>{showAddIngredientForm ? 'Schließen' : 'Zutat hinzufügen'}</span>
                  </button>
                </div>

                {ingredients.length > 0 ? (
                  <div className="space-y-1.5">
                    {ingredients.map((ing) => (
                      <div key={ing.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{ing.name}</span>
                          <span className="text-slate-500 text-[11px] ml-1.5">({ing.amount}{ing.unit})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-[11px] text-right">
                            <span className="font-bold text-emerald-700 block">{ing.calories} kcal</span>
                            <span className="text-slate-400 block text-[10px]">{ing.proteinG}g P • {ing.carbsG}g C • {ing.fatG}g F</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Keine einzelnen Zutaten aufgeführt. Du kannst optional Zutaten hinzufügen, um die Berechnung noch präziser zu machen.
                  </p>
                )}

                {/* Inline Sub-Form to add custom ingredient */}
                {showAddIngredientForm && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 mt-2">
                    <div className="text-xs font-bold text-slate-800">Neue Zutat zur Speise hinzufügen</div>
                    <div>
                      <input
                        type="text"
                        placeholder="Zutat Name (z.B. Olivenöl, Putenbrust)"
                        value={newIngName}
                        onChange={(e) => setNewIngName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">Menge ({unit})</label>
                        <input
                          type="number"
                          value={newIngAmount}
                          onChange={(e) => setNewIngAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-slate-50 rounded border border-slate-300 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500">kcal</label>
                        <input
                          type="number"
                          value={newIngCal}
                          onChange={(e) => setNewIngCal(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-slate-50 rounded border border-slate-300 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-indigo-600">Eiweiß</label>
                        <input
                          type="number"
                          step={0.1}
                          value={newIngProt}
                          onChange={(e) => setNewIngProt(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-slate-50 rounded border border-slate-300 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-amber-600">Carbs</label>
                        <input
                          type="number"
                          step={0.1}
                          value={newIngCarbs}
                          onChange={(e) => setNewIngCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-slate-50 rounded border border-slate-300 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-rose-600">Fett</label>
                        <input
                          type="number"
                          step={0.1}
                          value={newIngFat}
                          onChange={(e) => setNewIngFat(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs bg-slate-50 rounded border border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      disabled={!newIngName.trim()}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Zutat speichern & Nährwerte aktualisieren
                    </button>
                  </div>
                )}
              </div>

              {/* 100g Values Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Nährwerte pro 100 {unit}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Referenzwerte</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">kcal / 100{unit}</label>
                    <input
                      type="number"
                      min={0}
                      value={caloriesPer100g}
                      onChange={(e) => handlePer100gChange('cal', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-700 mb-1">Eiweiß (g)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={proteinPer100g}
                      onChange={(e) => handlePer100gChange('prot', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-700 mb-1">Carbs</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={carbsPer100g}
                      onChange={(e) => handlePer100gChange('carbs', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-rose-700 mb-1">Fett</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={fatPer100g}
                      onChange={(e) => handlePer100gChange('fat', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-bold bg-white rounded-lg border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Total Calculated Values for Portion */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                      Gesamte Nährwerte ({portionGrams === '' ? 0 : portionGrams} {unit})
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Berechnet anhand der Menge in {unit === 'g' ? 'Gramm' : 'Milliliter'}
                    </span>
                  </div>
                  <span className="text-lg font-black text-emerald-900">{calories} kcal</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold text-indigo-700 block">Eiweiß</span>
                    <span className="text-xs font-black text-slate-900">{proteinG} g</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold text-amber-700 block">Kohlenhydrate</span>
                    <span className="text-xs font-black text-slate-900">{carbsG} g</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold text-rose-700 block">Fett</span>
                    <span className="text-xs font-black text-slate-900">{fatG} g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Neu scannen
              </button>

              <button
                type="button"
                onClick={handleSaveMeal}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ins Tagebuch eintragen</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
