let userChartInstance = null;
let btcChartInstance = null;
let compareChartInstance = null;

function loadData() {
  const year = document.getElementById('year').value; // "2025" hoặc "2026"
  const month = document.getElementById('month').value;

  const yearIndex = year === "2025" ? 1 : 2; // chỉ số cột trong mảng [ngày, 2025, 2026]

  if (!data || !data.user || !data.btc) {
    document.getElementById('analysis').innerHTML = '<p style="color:red">Lỗi: Không load được data.js</p>';
    return;
  }

  const userData = data.user[month] || [];
  const btcData  = data.btc[month]  || [];

  if (userData.length === 0 || btcData.length === 0) {
    document.getElementById('analysis').innerHTML = '<p style="color:red">Không có dữ liệu cho tháng này.</p>';
    return;
  }

  // Labels: Ngày 1, 2, 3...
  const labels = userData.map(d => `Ngày ${d[0]}`);

  // Dữ liệu chỉ số theo năm đã chọn
  const userValues = userData.map(d => d[yearIndex]);
  const btcValues  = btcData.map(d  => d[yearIndex]);

  // ── Chart 1: User hàng ngày (bar) ──
  const userCtx = document.getElementById('userChart').getContext('2d');
  if (userChartInstance) userChartInstance.destroy();
  userChartInstance = new Chart(userCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `User - ${year}`,
        data: userValues,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Chỉ số' } } },
      plugins: { legend: { position: 'top' } }
    }
  });

  // ── Chart 2: BTC hàng ngày (bar) ──
  const btcCtx = document.getElementById('btcChart').getContext('2d');
  if (btcChartInstance) btcChartInstance.destroy();
  btcChartInstance = new Chart(btcCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `BTC - ${year}`,
        data: btcValues,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Chỉ số' } } },
      plugins: { legend: { position: 'top' } }
    }
  });

  // ── Chart 3: Line so sánh User vs BTC ──
  const compareCtx = document.getElementById('compareChart').getContext('2d');
  if (compareChartInstance) compareChartInstance.destroy();
  compareChartInstance = new Chart(compareCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `User - ${year}`,
          data: userValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 4
        },
        {
          label: `BTC - ${year}`,
          data: btcValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: `So sánh xu hướng User vs BTC - ${month} ${year}`
        }
      }
    }
  });

  // ── Phân tích nhanh đồng pha / nghịch pha trong tháng ──
  let analysisHTML = `<h3>Phân tích xu hướng trong tháng ${month} ${year}</h3>`;
  let sameDirection = 0;
  let oppositeDirection = 0;
  let totalDays = 0;

  for (let i = 1; i < userValues.length; i++) {
    const userDelta = userValues[i] - userValues[i-1];
    const btcDelta  = btcValues[i]  - btcValues[i-1];
    if (userDelta !== 0 || btcDelta !== 0) {
      totalDays++;
      if (userDelta * btcDelta > 0) sameDirection++;
      else if (userDelta * btcDelta < 0) oppositeDirection++;
    }
  }

  if (totalDays > 0) {
    const samePercent = ((sameDirection / totalDays) * 100).toFixed(1);
    const oppPercent  = ((oppositeDirection / totalDays) * 100).toFixed(1);
    analysisHTML += `
      <p>Trong ${totalDays} ngày có biến động:</p>
      <p><strong>Đồng pha:</strong> ${sameDirection} ngày (${samePercent}%)</p>
      <p><strong>Nghịch pha:</strong> ${oppositeDirection} ngày (${oppPercent}%)</p>
      <p style="font-weight:bold; color:${samePercent > oppPercent ? 'blue' : 'red'}">
        → Kết luận: Tháng này chủ yếu <u>${samePercent > oppPercent ? 'ĐỒNG PHA' : 'NGHỊCH PHA'}</u>
      </p>
    `;
  } else {
    analysisHTML += '<p>Không có biến động đáng kể trong tháng này.</p>';
  }

  document.getElementById('analysis').innerHTML = analysisHTML;
}
