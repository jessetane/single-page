module.exports = function (cb, opts) {
    var page = new Page(cb, opts);
    window.addEventListener('popstate', onpopstate);
    
    function onpopstate () {
        var href = window.location.pathname + window.location.search;
        page.show(href);
    }
    process.nextTick(onpopstate);
    
    var fn = function (href, replace) { return page.show(href, replace) };
    fn.push = function (href, replace) { return page.push(href, replace) };
    fn.show = function (href, replace) { return page.show(href, replace) };
    return fn;
};

function Page (cb, opts) {
    if (!opts) opts = {};
    this.current = null;
    this.hasPushState = opts.pushState !== undefined
        ? opts.pushState
        : window.history && window.history.pushState
    ;
    this.scroll = opts.saveScroll !== false ? {} : null;
    this.cb = cb;
}

Page.prototype.show = function (href, replace) {
    href = href.replace(/^\/+/, '/');
     
    if (this.current === href) return;
    this.saveScroll(href);
    this.current = href;
    
    var scroll = this.scroll[href];
    this.cb(href, {
        scrollX : scroll && scroll[0] || 0,
        scrollY : scroll && scroll[1] || 0
    });
    
    this.pushHref(href, replace);
};

Page.prototype.saveScroll = function (href) {
    if (this.scroll && this.current) {
        this.scroll[this.current] = [ window.scrollX, window.scrollY ];
    }
};

Page.prototype.push = function (href, replace) {
    href = href.replace(/^\/+/, '/');
    this.saveScroll(href);
    this.pushHref(href, replace);
};

Page.prototype.pushHref = function (href, replace) {
    this.current = href;
    var mismatched = window.location.pathname + window.location.search !== href;
    if (mismatched) {
        if (replace) {
            window.history.replaceState(null, '', href);
        }
        else {
            window.history.pushState(null, '', href);
        }
    }
};
