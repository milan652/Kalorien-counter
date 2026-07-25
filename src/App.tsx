import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Target } from 'lucide-react';
import { 
  auth, 
  fetchUserProfile, 
  saveUserProfile, 
  fetchMealEntriesForDate, 
  addMealEntry, 
  deleteMealEntry, 
  fetchWeightLogs, 
  addWeightLog, 
  signInAsGuest,
  logoutUser
} from './lib/firebase';
import { UserProfile, MealEntry, WeightLog, MealType } from './types';
import { formatDate } from './utils/calculator';
import { Header } from './components/Header';
import { DailyTracker } from './components/DailyTracker';
import { FoodScannerModal } from './components/FoodScannerModal';
import { AddMealModal } from './components/AddMealModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { AiCoachWidget } from './components/AiCoachWidget';
import { ProfileSettings } from './components/ProfileSettings';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Date State
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'daily' | 'coach' | 'profile'>('daily');

  // Data State
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFoodScannerOpen, setIsFoodScannerOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [addMealCategory, setAddMealCategory] = useState<MealType>('lunch');

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      setLoadingAuth(false);

      if (u) {
        const userProf = await fetchUserProfile(u.uid);
        setProfile(userProf);
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Data when user or selected date changes
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      const fetchedMeals = await fetchMealEntriesForDate(currentUser.uid, selectedDate);
      setMeals(fetchedMeals);

      const fetchedWeights = await fetchWeightLogs(currentUser.uid);
      setWeightLogs(fetchedWeights);
    };

    loadData();
  }, [currentUser, selectedDate]);

  // Handlers
  const handleSaveProfile = async (profileData: Omit<UserProfile, 'uid'>) => {
    let uid = currentUser?.uid;

    if (!currentUser) {
      // Auto sign in as guest
      const guest = await signInAsGuest();
      uid = guest.uid;
    }

    if (!uid) return;

    const fullProfile: UserProfile = {
      ...profileData,
      uid
    };

    await saveUserProfile(fullProfile);
    setProfile(fullProfile);
  };

  const handleAddMeal = async (mealData: {
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
  }) => {
    let uid = currentUser?.uid;

    if (!currentUser) {
      const guest = await signInAsGuest();
      uid = guest.uid;
    }

    if (!uid) return;

    const newEntry: Omit<MealEntry, 'id'> = {
      userId: uid,
      date: selectedDate,
      mealType: mealData.mealType,
      name: mealData.name,
      calories: mealData.calories,
      proteinG: mealData.proteinG,
      carbsG: mealData.carbsG,
      fatG: mealData.fatG,
      sugarG: mealData.sugarG || 0,
      fiberG: mealData.fiberG,
      portionSize: mealData.portionSize,
      portionGrams: mealData.portionGrams,
      unit: mealData.unit,
      caloriesPer100g: mealData.caloriesPer100g,
      proteinPer100g: mealData.proteinPer100g,
      carbsPer100g: mealData.carbsPer100g,
      fatPer100g: mealData.fatPer100g,
      sugarPer100g: mealData.sugarPer100g,
      imageUrl: mealData.imageUrl,
      isAiScanned: mealData.isAiScanned,
      timestamp: Date.now()
    };

    const docId = await addMealEntry(uid, newEntry);
    setMeals((prev) => [...prev, { id: docId, ...newEntry }]);
  };

  const handleDeleteMeal = async (entryId: string) => {
    if (!currentUser) return;
    await deleteMealEntry(currentUser.uid, entryId);
    setMeals((prev) => prev.filter((m) => m.id !== entryId));
  };

  const handleAddWeightLog = async (weightKg: number, notes?: string) => {
    let uid = currentUser?.uid;

    if (!currentUser) {
      const guest = await signInAsGuest();
      uid = guest.uid;
    }

    if (!uid) return;

    const newLog: Omit<WeightLog, 'id'> = {
      userId: uid,
      date: selectedDate,
      weightKg,
      notes,
      timestamp: Date.now()
    };

    const docId = await addWeightLog(uid, newLog);
    setWeightLogs((prev) => [...prev, { id: docId, ...newLog }]);
  };

  const handleLogout = async () => {
    await logoutUser();
    setProfile(null);
    setMeals([]);
    setWeightLogs([]);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Applikation wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show Onboarding Wizard if user is logged in or guest, but profile isn't completed yet
  const needsOnboarding = currentUser && (!profile || !profile.onboardingCompleted);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Top Header Navigation */}
      <Header
        user={currentUser}
        profile={profile}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenOnboarding={() => setActiveTab('profile')}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        
        {needsOnboarding ? (
          <div className="space-y-4">
            <OnboardingWizard onSave={handleSaveProfile} />
          </div>
        ) : !profile ? (
          /* Guest/Not-logged-in landing card that triggers instant onboarding */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                <Target className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Willkommen beim Kalorienplaner & KI-Scan</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Erstelle in wenigen Schritten deinen persönlichen Abnehmplan mit automatischer KI-Erkennung deiner Speisen.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={async () => {
                    await signInAsGuest();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Als Gast starten (Ersteinrichtung)
                </button>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Mit Konto anmelden
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Views */
          <div>
            {activeTab === 'daily' && (
              <DailyTracker
                profile={profile}
                meals={meals}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenAddMeal={(cat) => {
                  if (cat) setAddMealCategory(cat);
                  setIsAddMealOpen(true);
                }}
                onOpenAiScan={() => setIsFoodScannerOpen(true)}
                onDeleteMeal={handleDeleteMeal}
              />
            )}

            {activeTab === 'coach' && (
              <AiCoachWidget
                profile={profile}
                meals={meals}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSettings
                user={currentUser}
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-8">
        <p>Kalorien & Essensplaner mit KI • Flat Design & Firebase Integration</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <FoodScannerModal
        isOpen={isFoodScannerOpen}
        onClose={() => setIsFoodScannerOpen(false)}
        onAddMeal={handleAddMeal}
      />

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onAddMeal={handleAddMeal}
        defaultMealType={addMealCategory}
      />

    </div>
  );
}
