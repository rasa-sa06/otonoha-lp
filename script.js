/* ==========================================================
   親子リトミック教室「おとのは」LP
   スクロールで要素をふわっと表示する処理（外部ライブラリなし）

   しくみ
   - HTML で data-reveal を付けた要素は、それ自体がふわっと出る
   - data-reveal-group を付けた要素は、その「直接の子要素」が
     0.08秒ずつずれて順番に出る（カードが並ぶ場所用）
   - 一度表示したら監視をやめるので、動きは1回だけ
   ========================================================== */

// ① 本文を読み込む前に、<html> に「JSが動いている」目印を付ける。
//    CSS は .js が付いているときだけ要素を隠すので、
//    もしこのファイルが読み込めなくても、中身は普通に全部見える。
document.documentElement.classList.add('js');

// ② 本文（DOM）の読み込みが終わってから、要素を探して監視を始める
document.addEventListener('DOMContentLoaded', function () {
  var STAGGER = 0.08; // カードを順番に出すときのずれ（秒）

  var singles = document.querySelectorAll('[data-reveal]');
  var groups = document.querySelectorAll('[data-reveal-group]');

  // グループ内のカードに、何番目かに応じた待ち時間を CSS 変数で渡す
  groups.forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--reveal-delay', (i * STAGGER) + 's');
    });
  });

  // 要素を「表示済み」にする。CSS 側で is-visible が付くと動きが始まる
  function show(el) {
    if (el.hasAttribute('data-reveal-group')) {
      Array.prototype.forEach.call(el.children, function (child) {
        child.classList.add('is-visible');
      });
    } else {
      el.classList.add('is-visible');
    }
  }

  var targets = Array.prototype.slice.call(singles).concat(
    Array.prototype.slice.call(groups)
  );

  // 「動きを減らす」設定の人や、IntersectionObserver が使えない古いブラウザでは
  // 監視せずに、すぐ全部を表示する
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(show);
    return;
  }

  // IntersectionObserver：要素が画面に入ったかどうかを、
  // スクロールのたびに計算しなくてもブラウザが知らせてくれるしくみ
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target); // 1回出したら監視をやめる＝繰り返さない
      }
    });
  }, {
    // 画面の下から10%ぶん内側に入ったところで発火させ、
    // 画面の端ぎりぎりで動いて見逃すことがないようにする
    rootMargin: '0px 0px -10% 0px'
  });

  targets.forEach(function (el) {
    observer.observe(el);
  });
});
