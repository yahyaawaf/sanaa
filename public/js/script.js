document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const visitorCountElement = document.getElementById('visitorCount');
    const toastElement = document.getElementById('toast-message');

    // دالة لعرض الرسائل المنبثقة (Toast)
    const showToast = (message, duration = 3000) => {
        if (!toastElement) return;

        toastElement.textContent = message;
        toastElement.classList.add('show');

        setTimeout(() => {
            toastElement.classList.remove('show');
        }, duration);
    };
    const API_BASE = '/sanaa-mashor/api/';
    // دالة تحديث عداد الزوار
    const updateVisitorCounter = async () => {
        try {
            const response = await fetch('${API_BASE}visitors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page: window.location.pathname,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (visitorCountElement) {
                visitorCountElement.textContent = data.count.toLocaleString();
            }
        } catch (error) {
            console.error('Error updating visitor count:', error);
            showToast('تعذر تحديث عداد الزوار', 5000);

            if (visitorCountElement) {
                visitorCountElement.textContent = '--';
            }
        }
    };

    // دالة إعداد بطاقات التقارير
    const setupReportCards = () => {
        const cards = document.querySelectorAll('.report-card');

        cards.forEach(card => {
            const toggleBtn = card.querySelector('.toggle-report');
            const municipalityList = card.querySelector('.report-options-list');
            const yearList = card.querySelector('.year-options-list');
            const monthList = card.querySelector('.month-options-list');
            const dayWeekList = card.querySelector('.day-week-options-list');
            const closeBtn = card.querySelector('.close-options');

            // تحديد نوع التقرير من عنوان البطاقة
            const reportType = card.querySelector('.card-title').textContent.includes('اليومية') ? 'daily' :
                card.querySelector('.card-title').textContent.includes('الأسبوعية') ? 'weekly' :
                card.querySelector('.card-title').textContent.includes('الشهرية') ? 'monthly' : 'other';

            // بيانات الروابط لكل بلدية ونوع تقرير
            const reportLinks = {
                daily: {
                    alshqeeq: {
                        '2024': {
                            '1': {
                                '1': 'https://example.com/daily/alshqeeq/2024/1/1',
                                '2': 'https://example.com/daily/alshqeeq/2024/1/2'
                            }
                        }
                    }
                },
                weekly: {
                    alshqeeq: {
                        '2024': {
                            '1': {
                                '1': 'https://example.com/weekly/alshqeeq/2024/1/1'
                            }
                        }
                    }
                },
                monthly: {
                    alshqeeq: {
                        '2024': {
                            '1': 'https://example.com/monthly/alshqeeq/2024/1'
                        }
                    }
                },
                other: {
                    alshqeeq: 'https://example.com/other/alshqeeq'
                }
            };

            // إظهار قائمة البلديات
            if (toggleBtn && municipalityList) {
                toggleBtn.addEventListener('click', () => {
                    municipalityList.style.display = 'block';
                    yearList.style.display = 'none';
                    monthList.style.display = 'none';
                    dayWeekList.style.display = 'none';
                });
            }

            // اختيار بلدية
            card.querySelectorAll('.municipality-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const municipality = btn.getAttribute('data-municipality');
                    const municipalityName = btn.textContent.trim();
                    toggleBtn.textContent = municipalityName;
                    municipalityList.style.display = 'none';

                    if (reportType === 'other') {
                        const url = reportLinks.other[municipality];
                        if (!url) {
                            showToast('جاري تنفيذ العمل قريبًا');
                        } else {
                            window.open(url, '_blank');
                        }
                    } else {
                        yearList.style.display = 'block';
                        yearList.dataset.municipality = municipality;
                        yearList.dataset.municipalityName = municipalityName;
                        monthList.dataset.municipalityName = municipalityName;
                    }
                });
            });

            // اختيار سنة
            card.querySelectorAll('.year-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const year = btn.getAttribute('data-year');
                    const municipality = yearList.dataset.municipality;
                    const municipalityName = yearList.dataset.municipalityName;

                    yearList.style.display = 'none';

                    if (reportType === 'year') {
                        toggleBtn.textContent = `${municipalityName} - ${year}`;
                        const url = reportLinks.year?.[municipality]?.[year];
                        if (!url) {
                            showToast('جاري تنفيذ العمل قريبًا');
                        } else {
                            window.open(url, '_blank');
                        }
                    } else {
                        toggleBtn.textContent = `${municipalityName} - ${year}`;
                        monthList.style.display = 'block';
                        monthList.dataset.year = year;
                        monthList.dataset.municipality = municipality;
                        monthList.dataset.municipalityName = municipalityName;
                    }
                });
            });

            // اختيار شهر
            card.querySelectorAll('.month-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const month = btn.getAttribute('data-month');
                    const municipality = monthList.dataset.municipality;
                    const municipalityName = monthList.dataset.municipalityName;
                    const year = monthList.dataset.year;

                    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
                        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

                    toggleBtn.textContent = `${municipalityName} - ${monthNames[month - 1]} - ${year}`;
                    monthList.style.display = 'none';

                    if (reportType === 'monthly') {
                        const url = reportLinks.monthly[municipality]?.[year]?.[month];
                        if (!url) {
                            showToast('جاري تنفيذ العمل قريبًا');
                        } else {
                            window.open(url, '_blank');
                        }
                    } else {
                        dayWeekList.style.display = 'block';
                        dayWeekList.innerHTML = '';

                        const title = document.createElement('h4');
                        title.className = 'options-title';
                        title.textContent = reportType === 'daily' ? 'اختر اليوم' : 'اختر الأسبوع';
                        dayWeekList.appendChild(title);

                        if (reportType === 'daily') {
                            const daysGrid = document.createElement('div');
                            daysGrid.className = 'days-grid-container';

                            for (let day = 1; day <= 31; day++) {
                                const dayBtn = document.createElement('button');
                                dayBtn.className = 'day-btn';
                                dayBtn.setAttribute('data-day', day);
                                dayBtn.textContent = `${day} ${monthNames[month - 1]} ${year}`;

                                dayBtn.addEventListener('click', () => {
                                    const url = reportLinks.daily[municipality]?.[year]?.[month]?.[day];
                                    if (!url) {
                                        showToast('جاري تنفيذ العمل قريبًا');
                                    } else {
                                        window.open(url, '_blank');
                                    }
                                });

                                daysGrid.appendChild(dayBtn);
                            }

                            dayWeekList.appendChild(daysGrid);
                        } else if (reportType === 'weekly') {
                            const weeksGrid = document.createElement('div');
                            weeksGrid.className = 'weeks-grid-container';

                            for (let week = 1; week <= 4; week++) {
                                const weekBtn = document.createElement('button');
                                weekBtn.className = 'week-btn';
                                weekBtn.setAttribute('data-week', week);
                                weekBtn.textContent = `الأسبوع ${week}`;

                                weekBtn.addEventListener('click', () => {
                                    const url = reportLinks.weekly[municipality]?.[year]?.[month]?.[week];
                                    if (!url) {
                                        showToast('جاري تنفيذ العمل قريبًا');
                                    } else {
                                        window.open(url, '_blank');
                                    }
                                });

                                weeksGrid.appendChild(weekBtn);
                            }

                            dayWeekList.appendChild(weeksGrid);
                        }

                        const backBtn = document.createElement('button');
                        backBtn.className = 'back-btn';
                        backBtn.textContent = 'رجوع';
                        backBtn.addEventListener('click', () => {
                            dayWeekList.style.display = 'none';
                            monthList.style.display = 'block';
                        });

                        dayWeekList.appendChild(backBtn);
                    }
                });
            });

            // زر الرجوع العام
            card.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const currentText = toggleBtn.textContent;
                    const parts = currentText.split(' - ');

                    if (monthList.style.display === 'block') {
                        monthList.style.display = 'none';
                        yearList.style.display = 'block';
                        toggleBtn.textContent = reportType === 'monthly' ? parts[1] : parts[0] + ' - ' + parts[2];
                        return;
                    }

                    if (yearList.style.display === 'block') {
                        yearList.style.display = 'none';
                        municipalityList.style.display = 'block';
                        toggleBtn.textContent = 'اختيار البلدية';
                        return;
                    }

                    if (dayWeekList && dayWeekList.style.display === 'block') {
                        dayWeekList.style.display = 'none';
                        monthList.style.display = 'block';
                        toggleBtn.textContent = parts[0] + ' - ' + parts[2];
                    }
                });
            });

            // زر الإغلاق
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    municipalityList.style.display = 'none';
                    toggleBtn.textContent = 'اختيار البلدية';
                });
            }

            // معالجة أزرار التقارير الأخرى
            card.querySelectorAll('.modal-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const url = btn.getAttribute('data-url');
                    if (!url || url.trim() === "") {
                        showToast('جاري تنفيذ العمل قريبًا');
                    } else {
                        window.open(url, '_blank');
                    }
                });
            });
        });
    };

    // دالة لتحميل البيانات الأولية
    const loadInitialData = async () => {
        try {
            const response = await fetch(`${API_BASE}visitors?page=${encodeURIComponent(window.location.pathname)}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (visitorCountElement) visitorCountElement.textContent = data.count.toLocaleString();
        } catch (error) {
            console.error('Error loading initial visitor count:', error);
        }
    };

    // تهيئة التطبيق
    const init = async () => {
        try {
            await loadInitialData();
            await updateVisitorCounter();
            setupReportCards();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('حدث خطأ أثناء تهيئة التطبيق', 5000);
        }
    };

    // بدء التطبيق
    init();

    // تحديث العداد كل 5 دقائق
    setInterval(updateVisitorCounter, 5 * 60 * 1000);
});