import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Gift, 
  Trash2, 
  Plus, 
  Search, 
  Clock, 
  Sparkles,
  Heart,
  Save,
  X
} from 'lucide-react';

// -----------------------------------------------------------
// 🛠️ 辅助函数 (逻辑保持不变)
// -----------------------------------------------------------

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
  if (day <= zodiacSigns[month - 1].endDay) {
    return zodiacSigns[month - 1];
  } else {
    return zodiacSigns[month];
  }
};

const calculateBirthdayStats = (birthDateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const birthDate = new Date(birthDateString);
  const currentYear = today.getFullYear();
  
  let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(currentYear + 1);
  }
  
  const diffTime = nextBirthday - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const age = nextBirthday.getFullYear() - birthDate.getFullYear();
  const isToday = daysLeft === 0;

  return { daysLeft, age, isToday, nextBirthday };
};

// -----------------------------------------------------------
// 💎 组件 (高颜值 + 毛玻璃风格)
// -----------------------------------------------------------

const BirthdayCard = ({ item, onDelete }) => {
  const { daysLeft, age, isToday } = calculateBirthdayStats(item.date);
  const birthDateObj = new Date(item.date);
  const zodiac = getZodiacSign(birthDateObj.getDate(), birthDateObj.getMonth() + 1);

  // 动态样式：如果是今天，显示更炫酷的渐变
  const cardStyle = isToday 
    ? "bg-gradient-to-br from-pink-400/90 to-rose-500/90 text-white shadow-pink-300/50" 
    : "bg-white/70 hover:bg-white/90 text-slate-700 shadow-indigo-100/50";

  const textStyle = isToday ? "text-pink-100" : "text-slate-500";
  const highlightTextStyle = isToday ? "text-white" : "text-slate-800";
  const iconBg = isToday ? "bg-white/20" : "bg-indigo-50 text-indigo-500";

  return (
    <div className={`relative group backdrop-blur-md rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-white/50 ${cardStyle}`}>
      
      {/* 装饰光斑 */}
      {!isToday && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-start gap-5">
          {/* 头像框 */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${iconBg}`}>
            {isToday ? '🎂' : zodiac.icon}
          </div>
          
          <div>
            <h3 className={`font-bold text-xl flex items-center gap-2 ${highlightTextStyle}`}>
              {item.name}
              {isToday && <span className="text-xs bg-white text-pink-500 font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse"><Sparkles size={12}/> HBD!</span>}
            </h3>
            <div className={`text-sm mt-1.5 flex items-center gap-3 font-medium ${textStyle}`}>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {birthDateObj.getMonth() + 1}月{birthDateObj.getDate()}日
              </div>
              <span className="opacity-50">|</span>
              <span>{zodiac.sign}</span>
            </div>
            {item.note && (
              <p className={`text-xs mt-3 p-2 rounded-lg inline-block max-w-[180px] truncate ${isToday ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                💌 {item.note}
              </p>
            )}
          </div>
        </div>

        {/* 倒计时徽章 */}
        <div className="text-right">
          <div className={`text-3xl font-black tracking-tight ${isToday ? 'text-white drop-shadow-md' : daysLeft < 30 ? 'text-indigo-600' : 'text-slate-300'}`}>
            {isToday ? 'Today' : daysLeft}
          </div>
          {!isToday && <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${textStyle}`}>Days Left</div>}
        </div>
      </div>

      <div className={`mt-6 pt-4 border-t flex justify-between items-center relative ${isToday ? 'border-white/20' : 'border-slate-100'}`}>
        <div className={`text-xs font-medium flex items-center gap-1.5 ${textStyle}`}>
           <Gift size={15} /> 
           即将迎来 <span className={`text-base font-bold ${highlightTextStyle}`}>{age}</span> 岁
        </div>

        <button 
          onClick={() => onDelete(item.id)}
          className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full ${isToday ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
          title="删除"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// 🚀 主组件 (LocalStorage + UI升级版)
// -----------------------------------------------------------

const App = () => {
  // 初始化数据：尝试从 LocalStorage 读取，如果没有则为空数组
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('birthday-keeper-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNote, setNewNote] = useState('');

  // 💾 自动保存到本地存储
  useEffect(() => {
    localStorage.setItem('birthday-keeper-data', JSON.stringify(items));
  }, [items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newDate) return;

    const newItem = {
      id: Date.now().toString(),
      name: newName,
      date: newDate,
      note: newNote,
      createdAt: new Date().toISOString()
    };

    setItems([newItem, ...items]);
    setNewName('');
    setNewDate('');
    setNewNote('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定要删除这条生日记录吗？')) return;
    setItems(items.filter(item => item.id !== id));
  };

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
      if (statsA.daysLeft !== statsB.daysLeft) {
        return statsA.daysLeft - statsB.daysLeft;
      }
      return a.name.localeCompare(b.name);
    });
  }, [items, searchTerm]);

  const stats = useMemo(() => {
    const todayCount = sortedAndFilteredItems.filter(i => calculateBirthdayStats(i.date).daysLeft === 0).length;
    const thisMonthCount = sortedAndFilteredItems.filter(i => calculateBirthdayStats(i.date).daysLeft <= 30).length;
    return { todayCount, thisMonthCount };
  }, [sortedAndFilteredItems]);

  return (
    // 背景升级：梦幻极光渐变
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 font-sans text-slate-900 pb-20 selection:bg-indigo-200 selection:text-indigo-900">
      
      {/* 顶部导航栏 (毛玻璃效果) */}
      <header className="sticky top-0 z-40 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg shadow-indigo-100/50 border border-white/50 px-6 py-4 flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl blur opacity-30"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Gift size={24} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                  Birthday Keeper
                </h1>
                <p className="text-xs text-slate-500 font-medium">Capturing Moments</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowForm(!showForm)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${showForm ? 'bg-slate-200 text-slate-600 rotate-45' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-105'}`}
            >
              {showForm ? <Plus size={24} /> : <Plus size={24} />}
            </button>
          </div>

          {/* 悬浮统计胶囊 */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm text-sm text-pink-600 font-semibold">
              <Sparkles size={16} className="animate-pulse"/>
              <span>今天 {stats.todayCount} 人过生日</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-sm text-sm text-indigo-600 font-semibold">
              <Clock size={16} />
              <span>30天内 {stats.thisMonthCount} 人</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4">
        
        {/* 添加表单 (悬浮卡片) */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden origin-top ${showForm ? 'max-h-[500px] opacity-100 scale-100 mb-8' : 'max-h-0 opacity-0 scale-95'}`}>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 border border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Save size={16}/></span>
                添加新朋友
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="姓名"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Note</label>
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="备注 / 礼物点子..."
                  className="w-full px-5 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="查找朋友..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm focus:shadow-xl focus:shadow-indigo-100/50 focus:scale-[1.01] outline-none text-slate-700 font-medium transition-all"
          />
        </div>

        {/* 卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAndFilteredItems.length > 0 ? (
            sortedAndFilteredItems.map(item => (
              <BirthdayCard 
                key={item.id} 
                item={item} 
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-pink-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-white/50">
                  <Heart size={40} className="text-pink-300" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-700">还没有记录</h3>
              <p className="text-slate-400 mt-2">点击右上角的 + 号添加第一个朋友吧</p>
            </div>
          )}
        </div>
        
        <div className="h-20"></div>
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
