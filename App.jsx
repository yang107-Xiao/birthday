import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Calendar, 
  Gift, 
  Trash2, 
  Plus, 
  Search, 
  Clock, 
  User, 
  Sparkles,
  Heart
} from 'lucide-react';

// -----------------------------------------------------------
// 🔴 必须修改配置区域 (Configuration Area)
// -----------------------------------------------------------
// 请去 Firebase 控制台 -> 项目设置 (Project Settings) 
// -> 底部 "Your apps" -> 复制 SDK setup and configuration 中的内容替换下面
const firebaseConfig = {
  apiKey: "AIzaSyD-你的APIKey-请替换这里",
  authDomain: "你的项目ID.firebaseapp.com",
  projectId: "你的项目ID",
  storageBucket: "你的项目ID.appspot.com",
  messagingSenderId: "你的SenderId",
  appId: "你的AppId"
};

// 给你的应用起个名字（用于数据库路径，保持不变即可，防止和其他同学冲突）
const APP_NAME = "birthday-keeper-public"; 

// -----------------------------------------------------------
// 🔥 初始化 Firebase (无需修改)
// -----------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -----------------------------------------------------------
// 🛠️ 辅助函数 (Helper Functions)
// -----------------------------------------------------------

// 根据月日计算星座
const getZodiacSign = (day, month) => {
  const zodiacSigns = [
    { sign: "摩羯座", endDay: 19, icon: "♑" },
    { sign: "水瓶座", endDay: 18, icon: "♒" },
    { sign: "双鱼座", endDay: 20, icon: "♓" },
    { sign: "白羊座", endDay: 19, icon: "♈" },
    { sign: "金牛座", endDay: 20, icon: "♉" },
    { sign: "双子座", endDay: 20, icon: "♊" },
    { sign: "巨蟹座", endDay: 22, icon: "♋" },
    { sign: "狮子座", endDay: 22, icon: "♌" },
    { sign: "处女座", endDay: 22, icon: "♍" },
    { sign: "天秤座", endDay: 22, icon: "♎" },
    { sign: "天蝎座", endDay: 21, icon: "♏" },
    { sign: "射手座", endDay: 21, icon: "♐" },
    { sign: "摩羯座", endDay: 31, icon: "♑" },
  ];
  // Month is 1-12
  if (day <= zodiacSigns[month - 1].endDay) {
    return zodiacSigns[month - 1];
  } else {
    return zodiacSigns[month];
  }
};

// 计算倒计时和年龄
const calculateBirthdayStats = (birthDateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const birthDate = new Date(birthDateString);
  const currentYear = today.getFullYear();
  
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  // 如果今年生日已过，下一次就是明年
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }
  
  const diffTime = nextBirthday - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 计算即将到来的年龄
  const age = nextBirthday.getFullYear() - birthDate.getFullYear();
  
  const isToday = daysLeft === 0;

  return { daysLeft, age, isToday, nextBirthday };
};

// -----------------------------------------------------------
// 🧩 组件 (Components)
// -----------------------------------------------------------

const BirthdayCard = ({ item, onDelete, isOwner }) => {
  const { daysLeft, age, isToday } = calculateBirthdayStats(item.date);
  const birthDateObj = new Date(item.date);
  const zodiac = getZodiacSign(birthDateObj.getDate(), birthDateObj.getMonth() + 1);

  return (
    <div className={`relative group overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-xl border ${isToday ? 'bg-gradient-to-br from-pink-50 to-red-50 border-pink-200 shadow-pink-100' : 'bg-white border-slate-100 shadow-sm'}`}>
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 opacity-50 z-0"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-start gap-4">
          {/* 头像/图标 */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${isToday ? 'bg-pink-100 text-pink-600 animate-bounce' : 'bg-indigo-50 text-indigo-600'}`}>
            {isToday ? '🎂' : zodiac.icon}
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              {item.name}
              {isToday && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10}/> 生日快乐</span>}
            </h3>
            <div className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <Calendar size={14} />
              {birthDateObj.getMonth() + 1}月{birthDateObj.getDate()}日
              <span className="text-slate-300">|</span>
              <span>{zodiac.sign}</span>
            </div>
            {item.note && (
              <p className="text-slate-400 text-xs mt-2 italic bg-slate-50 p-1.5 rounded px-2 inline-block max-w-[200px] truncate">
                "{item.note}"
              </p>
            )}
          </div>
        </div>

        {/* 倒计时徽章 */}
        <div className="text-right">
          <div className={`text-2xl font-black ${isToday ? 'text-pink-500' : daysLeft < 30 ? 'text-indigo-600' : 'text-slate-300'}`}>
            {isToday ? 'Today!' : daysLeft}
          </div>
          {!isToday && <div className="text-xs text-slate-400 uppercase font-medium tracking-wider">天后</div>}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center relative">
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
           <Gift size={14} className={isToday ? 'text-pink-400' : ''}/> 
           即将满 <span className={`text-sm font-bold ${isToday ? 'text-pink-500' : 'text-slate-700'}`}>{age}</span> 岁
        </div>

        {/* 删除按钮 */}
        <button 
          onClick={() => onDelete(item.id)}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full text-slate-300 hover:text-red-500"
          title="删除此记录"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// 🚀 主组件 (Main App)
// -----------------------------------------------------------

const App = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 表单状态
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 认证初始化
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 匿名登录，不需要用户注册账号也能用
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. 数据获取 (实时监听)
  useEffect(() => {
    if (!user) return;

    // 这里的路径是：artifacts -> APP_NAME -> public -> data -> birthdays
    const q = query(
      collection(db, 'artifacts', APP_NAME, 'public', 'data', 'birthdays'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSnapshot = onSnapshot(q, 
      (snapshot) => {
        const loadedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItems(loadedItems);
        setLoading(false);
      },
      (error) => {
        console.error("Data fetch error:", error);
        // 如果这里报错，通常是因为 Firebase 规则没设置好
        setLoading(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  // 3. 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName || !newDate || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts', APP_NAME, 'public', 'data', 'birthdays'), {
        name: newName,
        date: newDate,
        note: newNote,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      
      // 重置表单
      setNewName('');
      setNewDate('');
      setNewNote('');
      setShowForm(false);
    } catch (error) {
      console.error("Add error:", error);
      alert("添加失败，请检查网络或 Firebase 配置");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. 删除功能
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条生日记录吗？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', APP_NAME, 'public', 'data', 'birthdays', id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // 5. 排序逻辑：按“距离生日还有多少天”排序
  const sortedAndFilteredItems = useMemo(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const statsA = calculateBirthdayStats(a.date);
      const statsB = calculateBirthdayStats(b.date);
      
      // 第一优先级：天数小的排前面
      if (statsA.daysLeft !== statsB.daysLeft) {
        return statsA.daysLeft - statsB.daysLeft;
      }
      // 第二优先级：名字首字母
      return a.name.localeCompare(b.name);
    });
  }, [items, searchTerm]);

  // 6. 顶部统计数据
  const stats = useMemo(() => {
    const todayCount = sortedAndFilteredItems.filter(i => calculateBirthdayStats(i.date).daysLeft === 0).length;
    const thisMonthCount = sortedAndFilteredItems.filter(i => calculateBirthdayStats(i.date).daysLeft <= 30).length;
    return { todayCount, thisMonthCount };
  }, [sortedAndFilteredItems]);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-mono">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Gift size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Birthday Keeper</h1>
                <p className="text-xs text-slate-500 font-medium">记住每一个重要的日子</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`p-2 rounded-full transition-colors ${showForm ? 'bg-slate-100 text-slate-600 rotate-45' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'}`}
            >
              <Plus size={24} className="transition-transform duration-300" />
            </button>
          </div>

          {/* 统计条 */}
          <div className="flex gap-4 text-sm overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg border border-pink-100 whitespace-nowrap">
              <Sparkles size={14} />
              <span className="font-bold">{stats.todayCount}</span> 今天过生日
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 whitespace-nowrap">
              <Clock size={14} />
              <span className="font-bold">{stats.thisMonthCount}</span> 30天内过生日
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        
        {/* 添加表单 (带折叠动画) */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User size={20} className="text-indigo-500"/>
              添加新成员
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">姓名 / 称呼</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：张三"
                    className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">出生日期</label>
                  <input 
                    type="date" 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">备注 / 礼物点子 (选填)</label>
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="例如：喜欢乐高，不要送书..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg mr-2 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '保存中...' : '保存生日'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索姓名或备注..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none placeholder-slate-400 text-slate-700"
          />
        </div>

        {/* 卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAndFilteredItems.length > 0 ? (
            sortedAndFilteredItems.map(item => (
              <BirthdayCard 
                key={item.id} 
                item={item} 
                onDelete={handleDelete}
                isOwner={user && item.createdBy === user.uid} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={24} className="text-slate-300" />
              </div>
              <p>还没有生日记录，快去添加一个吧！</p>
            </div>
          )}
        </div>
        
        {/* 底部留白 */}
        <div className="h-12"></div>
      </main>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;