(function(){
      const gate   = document.getElementById('preEnterGate');
      const btn    = document.getElementById('preEnterGateBtn');
      const status = document.getElementById('preEnterGateStatus');
      if(!gate || !btn || !status) return;

      function setReady(msg){
        gate.classList.add('isReady');
        status.textContent = msg || 'All assets have been loaded, you may enter the site!';
        btn.disabled = false;
      }

      // Odblokuj po pełnym załadowaniu
      window.addEventListener('load', function(){ setReady('All assets have been loaded, you may enter the site!'); }, { once: true });

      // Fallback: jeśli coś się „zawieśnie”, odblokuj po 6s
      window.setTimeout(function(){
        if(btn.disabled) setReady('All assets have been loaded, you may enter the site!');
      }, 6000);

      btn.addEventListener('click', function(){
        gate.classList.add('isLeaving');
        window.setTimeout(function(){
          gate.remove();
        }, 220);
      });
    })();
