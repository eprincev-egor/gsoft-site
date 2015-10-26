define([
  'jquery'
], function($) {

  // если нужно определить ширину текста в одну строку
  // то юзаем этот плагин
  $.fn.textLineWidth = function(params) {
    params = params || {};

    var $elem = this,
        elem = $elem.get(0);

    return textLineWidth(elem, params.text || elem.innerHTML);
  }

///  невидимый элемент на странице, по которому производим расчеты
    var clone = document.createElement('div'),
        cloneStyle = clone.style;

    cloneStyle.visibility = 'hidden';
    cloneStyle.position = 'absolute';
    cloneStyle.top = 0;
    cloneStyle.left = 0;

    document.body.appendChild(clone);

    function cloneStyles( elem ) {
      var elemStyle = getComputedStyle(elem);

      cloneStyle.lineHeight = elemStyle.lineHeight;
      cloneStyle.fontFamily = elemStyle.fontFamily;
      cloneStyle.fontSize = elemStyle.fontSize;
      cloneStyle.fontStyle = elemStyle.fontStyle;
      cloneStyle.letterSpacing = elemStyle.letterSpacing;
      cloneStyle.textRendering = elemStyle.textRendering;
      cloneStyle.fontWeight = elemStyle.fontWeight;
      cloneStyle.paddingLeft = elemStyle.paddingLeft;
      cloneStyle.paddingLeft = elemStyle.paddingRight;
      cloneStyle.paddingTop = elemStyle.paddingTop;
      cloneStyle.paddingBottom = elemStyle.paddingBottom;
      cloneStyle.boxSizing = elemStyle.boxSizing;

    }

    function textLineWidth(elem, text) {
      cloneStyles(elem);
      clone.innerHTML = text;

      return clone.offsetWidth;
    }

})
