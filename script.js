let dailyChartInstance = null;
let monthlyChartInstance = null;

function loadData() {
  const year = document.getElementById('year').value;
  const month = document.getElementById('month').value;

  if (!data || !data.user || !data.btc) {
    document.getElementById('analysis').innerHTML = '<p style="color:red">Lỗi: Dữ liệu data.js chưa load hoặc sai định dạng.</p>';
    return;
  }

  const userMonthData = data.user[month] || [];
  const btcMonthData  = data.btc[month]  || [];

  if (userMonthData.length === 0 || btcMonthData.length === 0) {
    document.getElementById('analysis').innerHTML = '<p style="color:red">Không có dữ liệu cho tháng này.</p>';
    return;
  }

  // ── Chart hàng ngày ──────────────────────────────────────────────
  const labels = userMonthData.map(d => `Ngày ${d[0]}`);

  const dailyCtx = document.getElementById('dailyChart').getContext('2d');

  if (dailyChartInstance) dailyChartInstance.destroy();

  dailyChartInstance = new Chart(dailyCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: `User ${year}`, data: userMonthData.map(d => d[year === '2025' ? 1 : 2]), backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 },
        { label: `BTC ${year}`,  data: btcMonthData.map(d  => d[year === '2025' ? 1 : 2]), backgroundColor: 'rgba(255, 99, 132, 0.6)',  borderColor: 'rgba(255, 99, 132, 1)',  borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Chỉ số' } } },
      plugins: { legend: { position: 'top' } }
    }
  });

  // ── Chart tổng tháng (line) ──────────────────────────────────────
  const allMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const userTotals = allMonths.map(m => {
    const arr = data.user[m] || [];
    return arr.reduce((sum, d) => sum + (year === '2025' ? d[1] : d[2]), 0);
  });
  const btcTotals = allMonths.map(m => {
    const arr = data.btc[m] || [];
    return arr.reduce((sum, d) => sum + (year === '2025' ? d[1] : d[2]), 0);
  });

  const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');

  if (monthlyChartInstance) monthlyChartInstance.destroy();

  monthlyChartInstance = new Chart(monthlyCtx, {
    type: 'line',
    data: {
      labels: allMonths,
      datasets: [
        { label: `User ${year} (Tổng tháng)`, data: userTotals, borderColor: 'rgba(54, 162, 235, 1)', fill: false, tension: 0.1 },
        { label: `BTC ${year} (Tổng tháng)`,  data: btcTotals,  borderColor: 'rgba(255, 99, 132, 1)',  fill: false, tension: 0.1 }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { position: 'top' } }
    }
  });

  // ── Phân tích pha ────────────────────────────────────────────────
  let analysisHTML = '<h3>Phân tích đồng pha / nghịch pha (so với tháng trước)</h3>';
  for (let i = 1; i < allMonths.length; i++) {
    const prevUser = userTotals[i-1];
    const currUser = userTotals[i];
    const prevBTC  = btcTotals[i-1];
    const currBTC  = btcTotals[i];

    const userDelta = currUser - prevUser;
    const btcDelta  = currBTC  - prevBTC;

    let text = '';
    if (userDelta * btcDelta > 0) {
      text = `Đồng pha: cả hai ${userDelta > 0 ? 'tăng' : 'giảm'} (User: ${userDelta > 0 ? '+' : ''}${userDelta}, BTC: ${btcDelta > 0 ? '+' : ''}${btcDelta})`;
    } else if (userDelta * btcDelta < 0) {
      text = `Nghịch pha: User ${userDelta > 0 ? 'tăng' : 'giảm'}, BTC ${btcDelta > 0 ? 'tăng' : 'giảm'} (User: ${userDelta > 0 ? '+' : ''}${userDelta}, BTC: ${btcDelta > 0 ? '+' : ''}${btcDelta})`;
    } else {
      text = 'Không thay đổi rõ rệt';
    }

    analysisHTML += `<p><strong>${allMonths[i]}:</strong> ${text}</p>`;
  }
  document.getElementById('analysis').innerHTML = analysisHTML;
}
