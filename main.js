/* ========================================
   施工会社LP - メインJavaScript
   Vanilla JS / 最小限の機能実装
   ======================================== */

(function() {
  'use strict';

  /* ========================================
     Before/After スライダー
     ======================================== */
  function initBeforeAfter() {
    const baElements = document.querySelectorAll('.ba');
    
    baElements.forEach(ba => {
      const container = ba.querySelector('.ba__container');
      const slider = ba.querySelector('.ba__slider');
      const beforeImage = ba.querySelector('.ba__image--before');
      const handle = ba.querySelector('.ba__handle');
      
      if (!slider || !beforeImage || !handle) return;
      
      // スライダー値変更時の処理
      function updatePosition(value) {
        const percentage = value;
        beforeImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        handle.style.left = `${percentage}%`;
      }
      
      // スライダー入力
      slider.addEventListener('input', function(e) {
        updatePosition(e.target.value);
      });
      
      // マウス/タッチドラッグ対応
      let isDragging = false;
      
      function handleMove(e) {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        const x = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
        const percentage = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
        
        slider.value = percentage;
        updatePosition(percentage);
      }
      
      function handleStart(e) {
        isDragging = true;
        handleMove(e);
        e.preventDefault();
      }
      
      function handleEnd() {
        isDragging = false;
      }
      
      container.addEventListener('mousedown', handleStart);
      container.addEventListener('touchstart', handleStart, { passive: false });
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      
      // キーボード操作対応
      slider.addEventListener('keydown', function(e) {
        let step = 5;
        if (e.shiftKey) step = 1;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          slider.value = Math.max(0, slider.value - step);
          updatePosition(slider.value);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          slider.value = Math.min(100, slider.value + step);
          updatePosition(slider.value);
        }
      });
      
      // 初期値
      updatePosition(slider.value);
    });
  }

  /* ========================================
     施工事例: サムネイルクリックで画像切り替え
     ======================================== */
  function initCaseThumbnails() {
    const thumbs = document.querySelectorAll('.cases__thumb');
    const baElement = document.querySelector('.ba');
    const beforeImage = baElement ? baElement.querySelector('.ba__image--before') : null;
    const afterImage = baElement ? baElement.querySelector('.ba__image--after') : null;
    const caption = baElement ? baElement.querySelector('.cases__caption') : null;
    const slider = baElement ? baElement.querySelector('.ba__slider') : null;
    
    if (!baElement || !beforeImage || !afterImage) return;
    
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        const beforeSrc = this.getAttribute('data-before');
        const afterSrc = this.getAttribute('data-after');
        const captionText = this.getAttribute('data-caption');
        
        if (beforeSrc && afterSrc) {
          // 画像を切り替え
          beforeImage.src = beforeSrc;
          afterImage.src = afterSrc;
          
          // data属性も更新（再初期化のため）
          baElement.setAttribute('data-before', beforeSrc);
          baElement.setAttribute('data-after', afterSrc);
          
          // キャプションを更新
          if (caption && captionText) {
            caption.textContent = captionText;
          }
          
          // スライダーを中央にリセット
          if (slider) {
            slider.value = 50;
            // ハンドル位置も更新
            const handle = baElement.querySelector('.ba__handle');
            if (handle) {
              handle.style.left = '50%';
              beforeImage.style.clipPath = 'inset(0 50% 0 0)';
            }
          }
          
          // アクティブ状態を更新（視覚的フィードバック）
          thumbs.forEach(t => t.classList.remove('cases__thumb--active'));
          this.classList.add('cases__thumb--active');
          
          // スムーズにスクロール（メインスライダーが見える位置へ）
          baElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
    
    // 初期状態で1つ目のサムネイルをアクティブに
    if (thumbs.length > 0) {
      thumbs[0].classList.add('cases__thumb--active');
    }
  }

  /* ========================================
     FAQ アコーディオン
     ======================================== */
  function initAccordion() {
    const accordionButtons = document.querySelectorAll('[data-accordion]');
    
    accordionButtons.forEach(button => {
      const targetId = button.getAttribute('data-accordion');
      const answer = document.getElementById(targetId + '-answer');
      
      if (!answer) return;
      
      // ハッシュリンク対応
      function checkHash() {
        const hash = window.location.hash;
        if (hash === '#' + targetId) {
          openAccordion();
        }
      }
      
      function openAccordion() {
        button.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      function closeAccordion() {
        button.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
      }
      
      function toggleAccordion() {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          closeAccordion();
        } else {
          openAccordion();
        }
      }
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        toggleAccordion();
      });
      
      // ページ読み込み時にハッシュをチェック
      checkHash();
    });
    
    // ハッシュ変更を監視
    window.addEventListener('hashchange', function() {
      accordionButtons.forEach(button => {
        const targetId = button.getAttribute('data-accordion');
        const hash = window.location.hash;
        const answer = document.getElementById(targetId + '-answer');
        
        if (hash === '#' + targetId && answer) {
          button.setAttribute('aria-expanded', 'true');
          answer.setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  /* ========================================
     フォームバリデーション
     ======================================== */
  function initFormValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    const fields = {
      name: {
        element: form.querySelector('#name'),
        validator: (value) => value.trim().length >= 2
      },
      tel: {
        element: form.querySelector('#tel'),
        validator: (value) => /^[0-9\-]+$/.test(value) && value.replace(/[^0-9]/g, '').length >= 10
      },
      email: {
        element: form.querySelector('#email'),
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      },
      contact_method: {
        element: form.querySelector('[name="contact_method"]:checked'),
        validator: () => form.querySelector('[name="contact_method"]:checked') !== null,
        allElements: form.querySelectorAll('[name="contact_method"]')
      },
      privacy: {
        element: form.querySelector('[name="privacy"]'),
        validator: (checked) => checked
      }
    };
    
    function getFieldErrorElement(fieldName) {
      const field = fields[fieldName];
      if (!field || !field.element) return null;
      
      const fieldContainer = field.element.closest('.contact__field');
      if (!fieldContainer) return null;
      
      return fieldContainer.querySelector('.contact__error');
    }
    
    function showError(fieldName, message) {
      const field = fields[fieldName];
      const errorEl = getFieldErrorElement(fieldName);
      
      if (field.element) {
        field.element.setAttribute('aria-invalid', 'true');
      }
      
      if (errorEl) {
        errorEl.textContent = message;
      }
    }
    
    function clearError(fieldName) {
      const field = fields[fieldName];
      const errorEl = getFieldErrorElement(fieldName);
      
      if (field.element) {
        field.element.setAttribute('aria-invalid', 'false');
      }
      
      if (errorEl) {
        errorEl.textContent = '';
      }
    }
    
    function validateField(fieldName) {
      const field = fields[fieldName];
      if (!field) return true;
      
      let value;
      let isValid;
      
      if (fieldName === 'contact_method') {
        const checked = form.querySelector('[name="contact_method"]:checked');
        isValid = checked !== null;
      } else if (fieldName === 'privacy') {
        value = field.element ? field.element.checked : false;
        isValid = field.validator(value);
      } else {
        value = field.element ? field.element.value.trim() : '';
        isValid = value !== '' && field.validator(value);
      }
      
      if (!isValid) {
        const messages = {
          name: 'お名前を2文字以上で入力してください',
          tel: '正しい電話番号を入力してください（10桁以上）',
          email: '正しいメールアドレスを入力してください',
          contact_method: 'ご希望の連絡方法を選択してください',
          privacy: 'プライバシーポリシーへの同意が必要です'
        };
        showError(fieldName, messages[fieldName] || '入力内容をご確認ください');
        return false;
      } else {
        clearError(fieldName);
        return true;
      }
    }
    
    function validateAll() {
      let isValid = true;
      Object.keys(fields).forEach(fieldName => {
        if (!validateField(fieldName)) {
          isValid = false;
        }
      });
      return isValid;
    }
    
    // リアルタイムバリデーション（離脱時）
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      
      if (fieldName === 'contact_method' && field.allElements) {
        field.allElements.forEach(el => {
          el.addEventListener('change', () => {
            validateField(fieldName);
          });
        });
      } else if (field.element) {
        if (field.element.type === 'checkbox') {
          field.element.addEventListener('change', () => {
            validateField(fieldName);
          });
        } else {
          field.element.addEventListener('blur', () => {
            validateField(fieldName);
          });
        }
      }
    });
    
    // フォーム送信
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validateAll()) {
        // エラーがある場合、最初のエラーフィールドにフォーカス
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      // バリデーション成功時の処理
      // 実際の実装では、ここでサーバーに送信
      console.log('Form validated successfully');
      
      // 送信成功のフィードバック（実装例）
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = '送信中...';
      submitButton.disabled = true;
      
      // ダミー送信（実際は fetch などで送信）
      setTimeout(() => {
        alert('お問い合わせありがとうございます。担当者より折り返しご連絡いたします。');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // エラー表示をクリア
        Object.keys(fields).forEach(fieldName => {
          clearError(fieldName);
        });
      }, 1000);
    });
  }

  /* ========================================
     初期化
     ======================================== */
  function init() {
    // DOMContentLoaded または既に読み込み済み
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initBeforeAfter();
        initCaseThumbnails();
        initAccordion();
        initFormValidation();
      });
    } else {
      initBeforeAfter();
      initCaseThumbnails();
      initAccordion();
      initFormValidation();
    }
  }
  
  init();

})();

