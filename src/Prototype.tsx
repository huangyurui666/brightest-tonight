import { useCallback, useEffect, useMemo, useState } from "react";
import { Body, DefineStar, Equator, Horizon, Illumination, Observer } from "astronomy-engine";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  Crosshair2Icon,
  DrawingPinFilledIcon,
  HamburgerMenuIcon,
  MoonIcon,
  ReloadIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { BottomSheet, MobileScroll } from "./mobile";

type CatalogStar = {
  id: string;
  nameZh: string;
  nameEn: string;
  constellation: string;
  ra: number;
  dec: number;
  magnitude: number;
  distanceLy: number;
  color: "gold" | "blue" | "white" | "orange";
  meaning: string;
  guidance: string[];
};

type Place = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timeZone: string;
};

type StarResult = CatalogStar & {
  altitude: number;
  azimuth: number;
  effectiveMagnitude: number;
  score: number;
  direction: string;
  message: string;
};

type Zodiac = {
  name: string;
  element: string;
  keyword: string;
  advice: string[];
};

const PLACES: Place[] = [
  { id: "los-angeles", label: "洛杉矶附近", latitude: 34.0522, longitude: -118.2437, timeZone: "America/Los_Angeles" },
  { id: "new-york", label: "纽约附近", latitude: 40.7128, longitude: -74.006, timeZone: "America/New_York" },
  { id: "beijing", label: "北京附近", latitude: 39.9042, longitude: 116.4074, timeZone: "Asia/Shanghai" },
  { id: "sydney", label: "悉尼附近", latitude: -33.8688, longitude: 151.2093, timeZone: "Australia/Sydney" },
  { id: "singapore", label: "新加坡附近", latitude: 1.3521, longitude: 103.8198, timeZone: "Asia/Singapore" },
];

const STAR_CATALOG: CatalogStar[] = [
  { id: "sirius", nameZh: "天狼星", nameEn: "Sirius", constellation: "大犬座", ra: 6.7525, dec: -16.7161, magnitude: -1.46, distanceLy: 8.6, color: "blue", meaning: "清晰与勇气", guidance: ["相信已经看见的答案", "把最重要的事放到第一位", "用直接沟通代替反复猜测"] },
  { id: "canopus", nameZh: "老人星", nameEn: "Canopus", constellation: "船底座", ra: 6.3992, dec: -52.6957, magnitude: -0.74, distanceLy: 310, color: "white", meaning: "方向与远行", guidance: ["为下一段旅程确定坐标", "选择长期方向而非短期噪声", "允许自己走得更远"] },
  { id: "hadar", nameZh: "马腹一", nameEn: "Hadar", constellation: "半人马座", ra: 14.0637, dec: -60.373, magnitude: -0.61, distanceLy: 390, color: "blue", meaning: "边界与行动", guidance: ["守住真正重要的边界", "把犹豫变成一个小动作", "今天适合明确说出需要"] },
  { id: "alpha-centauri", nameZh: "南门二", nameEn: "Alpha Centauri", constellation: "半人马座", ra: 14.6601, dec: -60.8339, magnitude: -0.27, distanceLy: 4.37, color: "gold", meaning: "联结与归属", guidance: ["靠近能让你安心的人", "一次真诚回应胜过完美表达", "让关系回到平等的位置"] },
  { id: "arcturus", nameZh: "大角星", nameEn: "Arcturus", constellation: "牧夫座", ra: 14.261, dec: 19.1825, magnitude: -0.05, distanceLy: 36.7, color: "orange", meaning: "丰收与笃定", guidance: ["承认已经取得的进展", "不必用速度证明价值", "今天适合收拢而非扩张"] },
  { id: "vega", nameZh: "织女星", nameEn: "Vega", constellation: "天琴座", ra: 18.6156, dec: 38.7837, magnitude: 0.03, distanceLy: 25, color: "gold", meaning: "专注与表达", guidance: ["保持方向，不必急着证明自己", "把复杂想法说得简单一点", "为真正热爱的事留出时间"] },
  { id: "capella", nameZh: "五车二", nameEn: "Capella", constellation: "御夫座", ra: 5.2782, dec: 45.998, magnitude: 0.08, distanceLy: 42.9, color: "gold", meaning: "照料与稳定", guidance: ["先照顾好自己的节奏", "稳定的小事正在积累结果", "温柔也可以是一种力量"] },
  { id: "rigel", nameZh: "参宿七", nameEn: "Rigel", constellation: "猎户座", ra: 5.2423, dec: -8.2016, magnitude: 0.13, distanceLy: 860, color: "blue", meaning: "开拓与决断", guidance: ["新的路径值得试一次", "给决定设一个明确期限", "能力会在行动中显现"] },
  { id: "betelgeuse", nameZh: "参宿四", nameEn: "Betelgeuse", constellation: "猎户座", ra: 5.9195, dec: 7.4071, magnitude: 0.42, distanceLy: 642, color: "orange", meaning: "转化与释放", guidance: ["变化正在腾出新的空间", "放下不再适合的旧版本", "今天允许计划被重新书写"] },
  { id: "procyon", nameZh: "南河三", nameEn: "Procyon", constellation: "小犬座", ra: 7.655, dec: 5.225, magnitude: 0.34, distanceLy: 11.5, color: "white", meaning: "敏锐与时机", guidance: ["留意那个一闪而过的机会", "先验证，再投入更多", "相信你的第一层判断"] },
  { id: "achernar", nameZh: "水委一", nameEn: "Achernar", constellation: "波江座", ra: 1.6286, dec: -57.2368, magnitude: 0.46, distanceLy: 139, color: "blue", meaning: "流动与适应", guidance: ["不必对抗所有变化", "换一种路径也能抵达", "今天适合轻装前进"] },
  { id: "altair", nameZh: "牛郎星", nameEn: "Altair", constellation: "天鹰座", ra: 19.8464, dec: 8.8683, magnitude: 0.77, distanceLy: 16.7, color: "white", meaning: "勇气与靠近", guidance: ["向重要的人多走一步", "把想法变成一次真实尝试", "坦率会带来新的连接"] },
  { id: "acrux", nameZh: "十字架二", nameEn: "Acrux", constellation: "南十字座", ra: 12.4433, dec: -63.0991, magnitude: 0.76, distanceLy: 320, color: "blue", meaning: "信念与导航", guidance: ["回到最初的判断标准", "方向清楚时不必解释太多", "让价值观替你做选择"] },
  { id: "aldebaran", nameZh: "毕宿五", nameEn: "Aldebaran", constellation: "金牛座", ra: 4.5987, dec: 16.5093, magnitude: 0.86, distanceLy: 65, color: "orange", meaning: "守护与承诺", guidance: ["兑现一个小小的承诺", "把注意力放回可控制之处", "可靠比漂亮更有力量"] },
  { id: "spica", nameZh: "角宿一", nameEn: "Spica", constellation: "室女座", ra: 13.4199, dec: -11.1614, magnitude: 0.98, distanceLy: 250, color: "blue", meaning: "成长与丰饶", guidance: ["给正在成长的事更多耐心", "今天适合学习和整理", "微小积累会带来转折"] },
  { id: "antares", nameZh: "心宿二", nameEn: "Antares", constellation: "天蝎座", ra: 16.4901, dec: -26.432, magnitude: 1.06, distanceLy: 550, color: "orange", meaning: "热情与真实", guidance: ["承认你真正想要什么", "强烈感受不等于必须立刻行动", "把能量用在创造而非内耗"] },
  { id: "pollux", nameZh: "北河三", nameEn: "Pollux", constellation: "双子座", ra: 7.7553, dec: 28.0262, magnitude: 1.14, distanceLy: 33.8, color: "orange", meaning: "伙伴与选择", guidance: ["和可信任的人交换观点", "两种答案可以同时成立", "今天适合共同完成一件事"] },
  { id: "fomalhaut", nameZh: "北落师门", nameEn: "Fomalhaut", constellation: "南鱼座", ra: 22.9608, dec: -29.6222, magnitude: 1.16, distanceLy: 25.1, color: "white", meaning: "愿景与纯粹", guidance: ["删去目标里不必要的部分", "想象你真正希望抵达的画面", "纯粹会带来更清楚的取舍"] },
  { id: "deneb", nameZh: "天津四", nameEn: "Deneb", constellation: "天鹅座", ra: 20.6905, dec: 45.2803, magnitude: 1.25, distanceLy: 2615, color: "white", meaning: "远见与耐心", guidance: ["远方目标需要更长的尺度", "今天的慢不代表没有前进", "用耐心保护真正重要的愿景"] },
  { id: "regulus", nameZh: "轩辕十四", nameEn: "Regulus", constellation: "狮子座", ra: 10.1395, dec: 11.9672, magnitude: 1.35, distanceLy: 79.3, color: "blue", meaning: "自信与责任", guidance: ["站到该由你决定的位置", "真正的自信不需要压过别人", "今天适合做出清晰承诺"] },
  { id: "polaris", nameZh: "北极星", nameEn: "Polaris", constellation: "小熊座", ra: 2.5303, dec: 89.2641, magnitude: 1.98, distanceLy: 433, color: "gold", meaning: "方向与恒常", guidance: ["回到那个长期不变的方向", "外界变化时更要守住坐标", "今天只需完成最重要的一步"] },
  { id: "alkaid", nameZh: "北斗七", nameEn: "Alkaid", constellation: "大熊座", ra: 13.7923, dec: 49.3133, magnitude: 1.86, distanceLy: 104, color: "blue", meaning: "告别与启程", guidance: ["完成一次干净的告别", "空出来的位置会迎来新事物", "今天适合结束拖延已久的事项"] },
];

const ZODIACS: Zodiac[] = [
  { name: "摩羯座", element: "土象", keyword: "沉淀", advice: ["先完成最难的一小步", "边界清晰会带来效率", "长期主义正在获得回报"] },
  { name: "水瓶座", element: "风象", keyword: "更新", advice: ["一个不同寻常的想法值得记录", "别急着让所有人理解你", "今天适合打破旧的排列方式"] },
  { name: "双鱼座", element: "水象", keyword: "感受", advice: ["直觉正在提醒你放慢一点", "温柔表达比回避更有效", "为想象力留一个出口"] },
  { name: "白羊座", element: "火象", keyword: "启动", advice: ["行动会让答案变清楚", "先做第一版，再讨论完美", "把能量集中到一个目标"] },
  { name: "金牛座", element: "土象", keyword: "稳固", advice: ["值得的事不需要仓促", "关注身体和现实资源", "坚持会比变化更有力量"] },
  { name: "双子座", element: "风象", keyword: "连接", advice: ["一次好奇的提问会打开局面", "把信息变成自己的判断", "今天适合主动联系"] },
  { name: "巨蟹座", element: "水象", keyword: "安定", advice: ["先确认自己的真实需要", "熟悉的人会带来支持", "照料自己不是退缩"] },
  { name: "狮子座", element: "火象", keyword: "发光", advice: ["大胆表达，但给别人留出空间", "被看见之前先认可自己", "今天适合承担主导角色"] },
  { name: "处女座", element: "土象", keyword: "整理", advice: ["修正一个细节就足够", "把复杂问题拆成清单", "不完美也可以先交付"] },
  { name: "天秤座", element: "风象", keyword: "平衡", advice: ["清晰选择比持续权衡更轻松", "关系需要真实而非讨好", "给美和秩序留一点空间"] },
  { name: "天蝎座", element: "水象", keyword: "洞察", advice: ["看见情绪背后的真实原因", "保留力量，不必急着回应", "今天适合结束消耗"] },
  { name: "射手座", element: "火象", keyword: "探索", advice: ["更大的视角会改变答案", "为新鲜经验留出时间", "先出发，路径会逐渐显现"] },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getDirection(azimuth: number) {
  const labels = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  return labels[Math.round(azimuth / 45) % 8];
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone, month: "numeric", day: "numeric" }).format(date);
}

function sunAltitude(date: Date, observer: Observer) {
  const eq = Equator(Body.Sun, date, observer, true, true);
  return Horizon(date, observer, eq.ra, eq.dec, "normal").altitude;
}

function findTonight(date: Date, observer: Observer) {
  if (sunAltitude(date, observer) < -6) return { date, mode: "此刻" };
  for (let minutes = 15; minutes <= 18 * 60; minutes += 15) {
    const candidate = new Date(date.getTime() + minutes * 60_000);
    if (sunAltitude(candidate, observer) < -8) return { date: candidate, mode: "今晚" };
  }
  return { date: new Date(date.getTime() + 6 * 60 * 60_000), mode: "今晚" };
}

function calculateStars(date: Date, observer: Observer, cloudCover: number | null): StarResult[] {
  const dayKey = Math.floor(date.getTime() / 86_400_000);
  return STAR_CATALOG.map((star) => {
    DefineStar(Body.Star1, star.ra, star.dec, star.distanceLy);
    const eq = Equator(Body.Star1, date, observer, true, true);
    const horizon = Horizon(date, observer, eq.ra, eq.dec, "normal");
    const sinAlt = Math.sin((Math.max(horizon.altitude, 1) * Math.PI) / 180);
    const airMass = 1 / (sinAlt + 0.50572 * Math.pow(Math.max(horizon.altitude, 1) + 6.07995, -1.6364));
    const effectiveMagnitude = star.magnitude + 0.2 * Math.max(0, airMass - 1);
    const cloudPenalty = cloudCover === null ? 5 : cloudCover * 0.23;
    const score = clamp(98 - (effectiveMagnitude + 1.5) * 9 + Math.min(horizon.altitude, 70) * 0.2 - cloudPenalty, 8, 99);
    return {
      ...star,
      altitude: horizon.altitude,
      azimuth: horizon.azimuth,
      effectiveMagnitude,
      score,
      direction: getDirection(horizon.azimuth),
      message: star.guidance[Math.abs(dayKey + star.id.length) % star.guidance.length],
    };
  })
    .filter((star) => star.altitude > 3)
    .sort((a, b) => {
      const aPenalty = a.altitude < 10 ? 1.2 : 0;
      const bPenalty = b.altitude < 10 ? 1.2 : 0;
      return a.effectiveMagnitude + aPenalty - (b.effectiveMagnitude + bPenalty) || b.altitude - a.altitude;
    })
    .slice(0, 10);
}

function nearestPlace(latitude: number, longitude: number): Place {
  return PLACES.reduce((closest, place) => {
    const currentDistance = Math.pow(place.latitude - latitude, 2) + Math.pow(place.longitude - longitude, 2);
    const closestDistance = Math.pow(closest.latitude - latitude, 2) + Math.pow(closest.longitude - longitude, 2);
    return currentDistance < closestDistance ? place : closest;
  });
}

function visibilityLabel(score: number) {
  if (score >= 77) return "很容易看到";
  if (score >= 58) return "较容易看到";
  return "条件一般";
}

function getZodiac(month: number, day: number): Zodiac {
  const edge = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22];
  const index = day < edge[month - 1] ? month - 1 : month % 12;
  return ZODIACS[index];
}

export default function Prototype() {
  const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
  const [place, setPlace] = useState<Place>(PLACES[0]);
  const [source, setSource] = useState<"sample" | "gps" | "manual">(demoMode ? "gps" : "sample");
  const [now, setNow] = useState(() => new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [cloudCover, setCloudCover] = useState<number | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStar, setSelectedStar] = useState<StarResult | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [horoscopeOpen, setHoroscopeOpen] = useState(false);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  useEffect(() => {
    document.title = "The Brightest Stars Above You · Starlit Tonight";
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const observer = useMemo(() => new Observer(place.latitude, place.longitude, 0), [place.latitude, place.longitude]);
  const baseObservation = useMemo(() => findTonight(now, observer), [now, observer]);
  const observationDate = useMemo(
    () => new Date(baseObservation.date.getTime() + timeOffset * 60_000),
    [baseObservation.date, timeOffset],
  );
  const stars = useMemo(() => calculateStars(observationDate, observer, cloudCover), [observationDate, observer, cloudCover]);
  const moonLight = useMemo(() => Math.round(Illumination(Body.Moon, observationDate).phase_fraction * 100), [observationDate]);
  const personalZodiac = birthMonth && birthDay ? getZodiac(Number(birthMonth), Number(birthDay)) : null;
  const primaryStar = stars[0] ?? null;
  const personalAdvice = useMemo(() => {
    if (!personalZodiac || !primaryStar) return "";
    const dayKey = Math.floor(observationDate.getTime() / 86_400_000);
    return personalZodiac.advice[Math.abs(dayKey + primaryStar.id.length + Number(birthDay)) % personalZodiac.advice.length];
  }, [personalZodiac, primaryStar, observationDate, birthDay]);

  const loadWeather = useCallback(async (latitude: number, longitude: number, fallbackTimeZone: string) => {
    try {
      const roundedLat = Math.round(latitude * 10) / 10;
      const roundedLon = Math.round(longitude * 10) / 10;
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&current=cloud_cover&timezone=auto`);
      if (!response.ok) throw new Error("weather unavailable");
      const data = await response.json();
      setCloudCover(typeof data.current?.cloud_cover === "number" ? data.current.cloud_cover : null);
      if (typeof data.timezone === "string") {
        setPlace((current) => ({ ...current, timeZone: data.timezone || fallbackTimeZone }));
      }
    } catch {
      setCloudCover(null);
    }
  }, []);

  useEffect(() => {
    void loadWeather(place.latitude, place.longitude, place.timeZone);
  }, [place.id, loadWeather]);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMessage("当前浏览器不支持定位，请选择一个城市。");
      setLocationOpen(true);
      return;
    }
    setIsLocating(true);
    setLocationMessage("正在识别你的位置…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearby = nearestPlace(latitude, longitude);
        const precisePlace: Place = {
          ...nearby,
          id: `gps-${latitude.toFixed(2)}-${longitude.toFixed(2)}`,
          latitude,
          longitude,
          label: `${nearby.label.replace("附近", "")}附近`,
        };
        setPlace(precisePlace);
        setSource("gps");
        setTimeOffset(0);
        setLocationMessage("位置识别完成。精确坐标只用于本次计算。");
        setIsLocating(false);
        setLocationOpen(false);
        void loadWeather(latitude, longitude, nearby.timeZone);
      },
      (error) => {
        const message = error.code === 1 ? "你没有开放位置权限，可以选择一个城市继续。" : "暂时没有拿到位置，可以重试或选择城市。";
        setLocationMessage(message);
        setIsLocating(false);
        setLocationOpen(true);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }, [loadWeather]);

  useEffect(() => {
    if (demoMode || !navigator.permissions) return;
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (permission.state === "granted") locate();
    }).catch(() => undefined);
  }, [demoMode, locate]);

  const choosePlace = (nextPlace: Place) => {
    setPlace(nextPlace);
    setSource("manual");
    setTimeOffset(0);
    setLocationMessage(`已按${nextPlace.label.replace("附近", "")}的天空计算。`);
    setLocationOpen(false);
  };

  const openHoroscope = () => {
    setSelectedStar(null);
    window.setTimeout(() => setHoroscopeOpen(true), 130);
  };

  const cloudText = cloudCover === null ? "云量未知" : cloudCover < 25 ? "天空晴朗" : cloudCover < 65 ? "有少量云" : "云层较多";
  const moonText = moonLight < 35 ? "月光影响低" : moonLight < 75 ? "月光影响中" : "月光影响高";
  const modeLabel = timeOffset === 0 ? baseObservation.mode : "自选时刻";
  const maxDay = birthMonth ? new Date(2024, Number(birthMonth), 0).getDate() : 31;

  return (
    <div className="star-app">
      <MobileScroll className="app-screen">
        <main className="screen-content" data-testid="star-screen" aria-label="The brightest stars above you tonight">
          <header className="topbar">
            <button className="place-button" onClick={() => setLocationOpen(true)} aria-label="选择观测地点">
              <DrawingPinFilledIcon /><span>{place.label}</span>
            </button>
            <span className={`gps-badge ${source === "gps" ? "is-live" : ""}`}>
              <span className="status-dot" />
              {source === "gps" ? "GPS 已识别" : source === "manual" ? "手动地点" : "示例位置"}
            </span>
            <button className="icon-button" onClick={() => setLocationOpen(true)} aria-label="打开地点菜单"><HamburgerMenuIcon /></button>
          </header>

          <div className="experience-grid">
            <div className="sky-column">
              <section className="hero-copy">
                <p className="eyebrow">STARLIT TONIGHT</p>
                <h1>The Brightest Stars<br />Above You</h1>
                <p className="poetic-line">Tonight, the sky meets you where you are.</p>
                <p className="observation-time">{formatDate(observationDate, place.timeZone)} {formatTime(observationDate, place.timeZone)} · {modeLabel}</p>
              </section>

              <section className="conditions" aria-label="观测条件">
                <MoonIcon /><span>{cloudText}</span><span className="condition-divider" /><span>{moonText}</span>
              </section>

              <section className="sky-panel" aria-label="天空方向示意">
                <div className="zenith-line" />
                <span className="zenith-label">天顶</span>
                <span className="horizon-label west">西</span>
                <span className="horizon-label east">东</span>
                {stars.slice(0, 5).map((star, index) => {
                  const x = 8 + ((star.azimuth + 90) % 180) / 180 * 84;
                  const y = 78 - clamp(star.altitude, 5, 85) / 85 * 62;
                  return (
                    <button
                      key={star.id}
                      className={`sky-star sky-star-${star.color} ${index === 0 ? "is-primary" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => setSelectedStar(star)}
                      aria-label={`查看${star.nameZh}`}
                    >
                      <StarFilledIcon />{index === 0 ? <span>{star.nameZh}</span> : null}
                    </button>
                  );
                })}
              </section>
            </div>

            <section className="results-section">
            <div className="section-heading">
              <div><p className="section-kicker">按有效亮度排序</p><h2>现在最值得看的 {Math.min(stars.length, 5)} 颗</h2></div>
              <button className="method-link" onClick={() => setTimeOpen(true)}>换时间</button>
            </div>

            <div className="star-list">
              {stars.slice(0, 5).map((star, index) => (
                <button className="star-card" key={star.id} onClick={() => setSelectedStar(star)}>
                  <span className={`star-emblem star-${star.color}`} aria-hidden="true"><StarFilledIcon /></span>
                  <span className="rank-number">{index + 1}</span>
                  <span className="star-main">
                    <span className="star-name-row"><strong>{star.nameZh}</strong><span>{star.nameEn}</span></span>
                    <span className="star-position">{star.direction} · 抬头 {Math.round(star.altitude)}°</span>
                    {index === 0 ? <span className="star-whisper"><StarFilledIcon /> 今日星语：{star.message}</span> : null}
                  </span>
                  <span className="star-meta">
                    <span className={`visibility ${star.score >= 77 ? "easy" : "fair"}`}>{visibilityLabel(star.score)}</span>
                    <span>视星等 {star.magnitude.toFixed(2)}</span>
                  </span>
                  <ChevronRightIcon className="chevron" />
                </button>
              ))}
            </div>

            <button className="personal-fortune-card" onClick={() => setHoroscopeOpen(true)}>
              <span className="fortune-icon"><StarFilledIcon /></span>
              <span><small>了解更多</small><strong>看看今晚的星星对你的专属启示</strong></span>
              <ChevronRightIcon />
            </button>
            <p className="mystic-note"><StarFilledIcon /> 星语和运势为娱乐性灵感，不属于天文学结论或现实预测。</p>
            </section>
          </div>
        </main>
      </MobileScroll>

      <nav className="bottom-controls" aria-label="观测控制">
        <button onClick={() => setTimeOpen(true)}><ClockIcon /><span><small>{modeLabel}</small>{formatTime(observationDate, place.timeZone)}</span><ChevronDownIcon /></button>
        <span className="bottom-divider" />
        <button onClick={locate} disabled={isLocating}>{isLocating ? <ReloadIcon className="spin" /> : <Crosshair2Icon />}<span>{isLocating ? "定位中" : source === "gps" ? "刷新位置" : "使用我的位置"}</span></button>
      </nav>

      <BottomSheet open={locationOpen} onOpenChange={setLocationOpen} title="选择观测地点" description="GPS 精确坐标只在当前页面用于天文计算；天气请求使用约 11 公里的模糊坐标。" snap={0.58}>
        <div className="sheet-actions">
          <button className="primary-sheet-button" onClick={locate} disabled={isLocating}><Crosshair2Icon /> {isLocating ? "正在识别位置…" : "使用我的当前位置"}</button>
          {locationMessage ? <p className="location-message">{locationMessage}</p> : null}
          <p className="sheet-label">或选择城市</p>
          <div className="city-grid">
            {PLACES.map((item) => <button key={item.id} onClick={() => choosePlace(item)} className={place.id === item.id ? "active" : ""}>{item.label.replace("附近", "")}</button>)}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={timeOpen} onOpenChange={setTimeOpen} title="选择观测时间" description={`以${modeLabel === "此刻" ? "当前时刻" : "今晚入夜"}为起点，查看未来 4 小时的星空变化。`} snap={0.48}>
        <div className="time-sheet">
          <strong>{formatTime(observationDate, place.timeZone)}</strong>
          <span>{timeOffset === 0 ? modeLabel : `起点后 ${timeOffset / 60} 小时`}</span>
          <input aria-label="观测时间偏移" type="range" min="0" max="240" step="15" value={timeOffset} onChange={(event) => setTimeOffset(Number(event.target.value))} data-scroll-drag="ignore" />
          <div className="time-presets">{[0, 60, 120, 240].map((minutes) => <button key={minutes} className={timeOffset === minutes ? "active" : ""} onClick={() => setTimeOffset(minutes)}>{minutes === 0 ? modeLabel : `+${minutes / 60}h`}</button>)}</div>
        </div>
      </BottomSheet>

      <BottomSheet open={Boolean(selectedStar)} onOpenChange={(open) => { if (!open) setSelectedStar(null); }} title={selectedStar ? `${selectedStar.nameZh} · ${selectedStar.nameEn}` : "恒星详情"} description={selectedStar ? `${selectedStar.constellation} · 距离地球约 ${selectedStar.distanceLy} 光年` : undefined} snap={0.76}>
        {selectedStar ? (
          <div className="star-detail">
            <div className="detail-orb"><StarFilledIcon /></div>
            <div className="detail-stats">
              <span><small>方向</small>{selectedStar.direction} {Math.round(selectedStar.azimuth)}°</span>
              <span><small>高度</small>{Math.round(selectedStar.altitude)}°</span>
              <span><small>视星等</small>{selectedStar.magnitude.toFixed(2)}</span>
            </div>
            <section className="finding-card"><p>怎么找到它</p><strong>面向{selectedStar.direction}，从地平线向上约 {Math.max(1, Math.round(selectedStar.altitude / 10))} 个拳头。</strong><span>手臂伸直时，一个拳头约等于 10°。</span></section>
            <section className="meaning-card">
              <p><StarFilledIcon /> 今日星语 · 娱乐灵感</p><h3>{selectedStar.meaning}</h3><blockquote>“{selectedStar.message}”</blockquote><span>星语依据日期与恒星主题生成，不是科学预测。</span>
              <button className="learn-more-button" onClick={openHoroscope}>了解更多 · 看我的今日星运 <ChevronRightIcon /></button>
            </section>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet open={horoscopeOpen} onOpenChange={setHoroscopeOpen} title="我的今日星运" description="输入生日的月和日即可判断星座；无需年份，不上传、不保存。" snap={0.78}>
        <div className="horoscope-sheet">
          {!personalZodiac ? (
            <>
              <div className="birthday-intro"><StarFilledIcon /><strong>今晚哪颗星与你最有共鸣？</strong><span>生日只在当前设备即时计算，关闭页面后即消失。</span></div>
              <div className="birthday-fields">
                <label><span>出生月份</span><select value={birthMonth} onChange={(event) => { setBirthMonth(event.target.value); setBirthDay(""); }}><option value="">选择月份</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 月</option>)}</select></label>
                <label><span>出生日期</span><select value={birthDay} disabled={!birthMonth} onChange={(event) => setBirthDay(event.target.value)}><option value="">选择日期</option>{Array.from({ length: maxDay }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 日</option>)}</select></label>
              </div>
              <p className="privacy-inline">我们只需要月和日来判断西方太阳星座，不需要出生年份或姓名。</p>
            </>
          ) : (
            <div className="fortune-result">
              <div className="zodiac-heading"><span>{personalZodiac.element}</span><h3>{personalZodiac.name}</h3><p>今日主题 · {personalZodiac.keyword}</p></div>
              <section className="fortune-hero">
                <p>今晚主星 · {primaryStar?.nameZh}</p>
                <blockquote>“{personalAdvice}”</blockquote>
                <span>{primaryStar?.nameZh}象征「{primaryStar?.meaning}」，与{personalZodiac.name}今天的「{personalZodiac.keyword}」主题形成呼应。</span>
              </section>
              <div className="fortune-grid">
                <span><small>整体能量</small><strong>{primaryStar && primaryStar.score >= 75 ? "★★★★☆" : "★★★☆☆"}</strong></span>
                <span><small>幸运方向</small><strong>{primaryStar?.direction ?? "东方"}</strong></span>
              </div>
              <p className="fortune-disclaimer">娱乐内容仅用于自我反思，不构成感情、健康、财务或其他现实决策建议。</p>
              <button className="reset-birthday" onClick={() => { setBirthMonth(""); setBirthDay(""); }}>重新输入生日</button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
