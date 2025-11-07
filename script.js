// -------------------------------
// بيانات افتراضية عند أول تشغيل
// -------------------------------
const defaultAlerts = [
  {
    id: 1,
    course: "cs101",
    type: "واجب",
    title: "تسليم تمرين 1",
    desc: "رفع ملف المشروع على المنصة",
    start: "2025-09-01",
    due: "2025-09-25",
    status: "yellow", // جديد
  },
  {
    id: 2,
    course: "cs101",
    type: "اختبار",
    title: "اختبار منتصف الفصل",
    desc: "يومي عبر المنصة",
    start: "2025-09-10",
    due: "2025-09-20",
    status: "red", // مفتوح لم يُنجز
  },
  {
    id: 3,
    course: "math201",
    type: "مشروع",
    title: "مشروع نهائي",
    desc: "تقديم عرض ورفع ملف",
    start: "2025-08-20",
    due: "2025-10-01",
    status: "green", // منجز
  },
];

// -------------------------------
// متغيرات عامة + عناصر DOM
// -------------------------------
let alerts = JSON.parse(localStorage.getItem("alerts_v2")) || defaultAlerts;
let currentCourse = "cs101"; 
let editingId = null; 

// عناصر
const alertsList = document.getElementById("alertsList");
const emptyState = document.getElementById("emptyState");
const summary = document.getElementById("summary");
const courseList = document.getElementById("courseList");
const modal = document.getElementById("modal");
const newAlertBtn = document.getElementById("newAlertBtn");
const cancelBtn = document.getElementById("cancelBtn");
const alertForm = document.getElementById("alertForm");
const roleSelect = document.getElementById("roleSelect");
const statsPanel = document.getElementById("statsPanel");

// -------------------------------
// دوال المساعدة
// -------------------------------
function saveAlerts() {
  localStorage.setItem("alerts_v2", JSON.stringify(alerts));
}

function render() {
  const filtered = alerts.filter((a) => a.course === currentCourse);

  alertsList.innerHTML = "";
  summary.textContent = `${filtered.length} تنبيه`;

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach((a) => {
    alertsList.appendChild(createAlertCard(a));
  });
}

// إنشاء بطاقة تنبيه
function createAlertCard(alert) {
  const li = document.createElement("li");
  li.className = "alert-card";

  const meta = document.createElement("div");
  meta.className = "alert-meta";
  meta.innerHTML = `<span>${alert.type}</span><span>تسليم: ${alert.due}</span>`;

  const title = document.createElement("div");
  title.className = "alert-title";
  title.textContent = alert.title;

  const desc = document.createElement("div");
  desc.className = "alert-desc";
  desc.textContent = alert.desc || "";

  const badge = document.createElement("div");
  badge.className = `badge ${alert.status}`;
  badge.textContent =
    alert.status === "yellow"
      ? "جديد"
      : alert.status === "red"
      ? "مفتوح لم يُنجز"
      : "منجَز";

  const actions = document.createElement("div");
  actions.className = "alert-actions";

  if (roleSelect.value === "teacher") {
    // أزرار المعلم
    const toggleBtn = makeButton(
      alert.status === "green" ? "إعادة وضع" : "وضع كمنجَز",
      "btn ghost",
      () => toggleStatus(alert.id)
    );

    const editBtn = makeButton("تعديل", "btn ghost", () =>
      openModalForEdit(alert.id)
    );

    const delBtn = makeButton("حذف", "btn danger", () => deleteAlert(alert.id));

    actions.append(toggleBtn, editBtn, delBtn);
  }

  if (roleSelect.value === "student") {
    // إذا الطالب فتح تنبيه جديد (أصفر) → يتحول إلى أحمر
    li.addEventListener("click", () => {
      if (alert.status === "yellow") {
        alert.status = "red";
        saveAlerts();
        render();
      }
    });

    // زر "تسليم" للطالب فقط إذا كان مفتوح (أحمر)
    if (alert.status === "red") {
      const submitBtn = makeButton("تسليم", "btn ghost", () => {
        alert.status = "green";
        saveAlerts();
        render();
      });
      actions.append(submitBtn);
    }
  }

  li.append(meta, title, desc, badge, actions);
  return li;
}

// إنشاء زر
function makeButton(text, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

// -------------------------------
// العمليات الأساسية
// -------------------------------
function toggleStatus(id) {
  alerts = alerts.map((a) =>
    a.id === id ? { ...a, status: a.status === "green" ? "red" : "green" } : a
  );
  saveAlerts();
  render();
}

function deleteAlert(id) {
  if (!confirm("هل تريد حذف هذا التنبيه؟")) return;
  alerts = alerts.filter((a) => a.id !== id);
  saveAlerts();
  render();
}

// -------------------------------
// المودال (إنشاء / تعديل)
// -------------------------------
function openModal() {
  editingId = null;
  document.getElementById("modalTitle").textContent = "إنشاء تنبيه جديد";
  alertForm.reset();
  modal.classList.remove("hidden");
}

function openModalForEdit(id) {
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return;

  editingId = id;
  document.getElementById("modalTitle").textContent = "تعديل التنبيه";

  document.getElementById("type").value = alert.type;
  document.getElementById("title").value = alert.title;
  document.getElementById("desc").value = alert.desc;
  document.getElementById("start").value = alert.start;
  document.getElementById("due").value = alert.due;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

alertForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    id: editingId || Date.now(),
    course: currentCourse,
    type: document.getElementById("type").value,
    title: document.getElementById("title").value,
    desc: document.getElementById("desc").value,
    start: document.getElementById("start").value,
    due: document.getElementById("due").value,
    status: editingId ? getOldStatus(editingId) : "yellow",
  };

  if (editingId) {
    alerts = alerts.map((a) => (a.id === editingId ? { ...payload } : a));
  } else {
    alerts.push(payload);
  }

  saveAlerts();
  render();
  closeModal();
});

function getOldStatus(id) {
  const found = alerts.find((a) => a.id === id);
  return found ? found.status : "yellow";
}

// -------------------------------
// التنقل بين المقررات
// -------------------------------
courseList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  [...courseList.children].forEach((x) => x.classList.remove("active"));
  li.classList.add("active");

  currentCourse = li.dataset.course;
  render();
});

// -------------------------------
// التحكم في الدور (طالب / معلم)
// -------------------------------
function updateRoleUI() {
  const role = roleSelect.value;

  if (role === "student") {
    newAlertBtn.style.display = "none"; 
    statsPanel.classList.add("hidden"); 
  } else {
    newAlertBtn.style.display = "inline-block"; 
    statsPanel.classList.remove("hidden"); 
  }

  render();
}

roleSelect.addEventListener("change", updateRoleUI);
updateRoleUI(); 

// -------------------------------
// أحداث عامة
// -------------------------------
newAlertBtn.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);

// -------------------------------
// تهيئة أولية
// -------------------------------
render();

// -------------------------------
// إحصائيات الطلاب — تفاعلية كاملة
// -------------------------------
function updateStats() {
  const currentAlerts = alerts.filter(a => a.course === currentCourse);
  const openedBar = document.getElementById("openedBar");
  const submittedBar = document.getElementById("submittedBar");
  const openedPercent = document.getElementById("openedPercent");
  const submittedPercent = document.getElementById("submittedPercent");

  if (currentAlerts.length === 0) {
    openedBar.style.width = "0%";
    submittedBar.style.width = "0%";
    openedPercent.textContent = "0% (0)";
    submittedPercent.textContent = "0% (0)";
    return;
  }

  // حالات التنبيهات
  const total = currentAlerts.length;
  const opened = currentAlerts.filter(a => a.status === "red" || a.status === "green").length;
  const submitted = currentAlerts.filter(a => a.status === "green").length;
  const notSubmitted = total - submitted;

  // حساب النسب
  const openedRatio = Math.round((opened / total) * 100);
  const submittedRatio = Math.round((submitted / total) * 100);

  // تحديث العرض
  openedBar.style.width = openedRatio + "%";
  submittedBar.style.width = submittedRatio + "%";
  openedPercent.textContent = `${openedRatio}% (${opened} من ${total})`;
  submittedPercent.textContent = `${submittedRatio}% (${submitted} سلموا / ${notSubmitted} لم يسلموا)`;
}

// تحديث render بحيث يستدعي الإحصائيات دائمًا
const oldRender = render;
render = function() {
  oldRender();
  updateStats();
};

// استدعاء أولي
updateStats();
