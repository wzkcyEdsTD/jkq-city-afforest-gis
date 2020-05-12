/**
*鹰眼控件类
*@module controls
*@class DCI.Controls.MiniMap
*@extends L.Control
*/
define("controls/minimap", [
    "leaflet",
    "core/dcins"
], function (L) {

    L.DCI.Controls.MiniMap = L.Control.extend({
        options: {
            position: 'bottomright',
            toggleDisplay: true,
            zoomLevelOffset: -5,
            zoomLevelFixed: false,
            zoomAnimation: false,
            autoToggleDisplay: false,
            width: 150,
            height: 150,
            aimingRectOptions: { color: "#ff7800", weight: 1, clickable: false },
            shadowRectOptions: { color: "#000000", weight: 1, clickable: false, opacity: 0, fillOpacity: 0 }
        },

        hideText: '隐藏鹰眼',

        showText: '显示鹰眼',

        link: null,

        initialize: function (layer, options) {
            L.Util.setOptions(this, options);
            this.options.aimingRectOptions.clickable = false;
            this.options.shadowRectOptions.clickable = false;
            this._layer = layer;
        },

        onAdd: function (map) {
            this._mainMap = map;
            this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
            this._container.style.width = this.options.width + 'px';
            this._container.style.height = this.options.height + 'px';
            L.DomEvent.disableClickPropagation(this._container);
            L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


            this._miniMap = new L.Map(this._container, {
                attributionControl: false,
                zoomControl: false,
                zoomAnimation:false,
                autoToggleDisplay: this.options.autoToggleDisplay,
                touchZoom: !this.options.zoomLevelFixed,
                scrollWheelZoom: !this.options.zoomLevelFixed,
                doubleClickZoom: !this.options.zoomLevelFixed,
                panControl: false,
                boxZoom: !this.options.zoomLevelFixed,
                crs: map.options.crs
            });

            this._miniMap.addLayer(this._layer);
            this._mainMapMoving = true;
            this._miniMapMoving = true;
            this._userToggledDisplay = false;
            this._minimized = false;

            if (this.options.toggleDisplay) {
                this._addToggleButton();
            }

            this._miniMap.whenReady(L.Util.bind(function () {
                /*在分屏后导致死循环*/
                //this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);
                //this._shadowRect = L.rectangle(this._mainMap.getBounds(), this.options.shadowRectOptions).addTo(this._miniMap);

                ////实例方法重写  防止陷入死循环
                //this._aimingRect._fireMapMoveEnd = this._fireMapMoveEnd;
                //this._shadowRect._fireMapMoveEnd = this._fireMapMoveEnd;

                //this._mainMap.on('moveend', this._onMainMapMoved, this);
                //this._mainMap.on('move', this._onMainMapMoving, this);
                //this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
                //this._miniMap.on('move', this._onMiniMapMoving, this);
                //this._miniMap.on('moveend', this._onMiniMapMoved, this);
            }, this));

            return this._container;
        },

        _fireMapMoveEnd: function () {
            L.Path._updateRequest = null;
            this.fire('moveend', { miniMapRectangle: true });
        },

        addTo: function (map) {
            L.Control.prototype.addTo.call(this, map);
            this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
            this._setDisplay(this._decideMinimized());
            return this;
        },

        onRemove: function (map) {
            this._mainMap.off('moveend', this._onMainMapMoved, this);
            this._mainMap.off('move', this._onMainMapMoving, this);
            this._miniMap.off('moveend', this._onMiniMapMoved, this);

            this._miniMap.removeLayer(this._layer);
        },

        _addToggleButton: function () {
            this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
				'', this.hideText, 'leaflet-control-minimap-toggle-display', this._container, this._toggleDisplayButtonClicked, this) : undefined;
        },

        _createButton: function (html, title, className, container, fn, context) {
            this.link = L.DomUtil.create('a', className, container);
            this.link.innerHTML = html;
            this.link.href = '#';
            this.link.title = title;

            var stop = L.DomEvent.stopPropagation;

            L.DomEvent
			.on(this.link, 'click', stop)
			.on(this.link, 'mousedown', stop)
			.on(this.link, 'dblclick', stop)
			.on(this.link, 'click', L.DomEvent.preventDefault)
			.on(this.link, 'click', fn, context);

            this.link.style.width = "19px";
            this.link.style.height = "19px";
            return this.link;
        },

        _toggleDisplayButtonClicked: function () {
            this._userToggledDisplay = true;
            if (!this._minimized) {
                this._minimize();
                this._toggleDisplayButton.title = this.showText;
            }
            else {
                this._restore();
                this._toggleDisplayButton.title = this.hideText;
            }
        },

        _setDisplay: function (minimize) {
            if (minimize != this._minimized) {
                if (!this._minimized) {
                    this._minimize();
                }
                else {
                    this._restore();
                }
            }
        },

        _minimize: function () {
            // hide the minimap
            if (this.options.toggleDisplay) {
                this._container.style.width = '28px';
                this._container.style.height = '28px';
                this.link.style.width = "28px";
                this.link.style.height = "28px";
                this._toggleDisplayButton.className += ' minimized';
            }
            else {
                this._container.style.display = 'none';
            }
            this._minimized = true;
        },

        _restore: function () {
            if (this.options.toggleDisplay) {
                this._container.style.width = this.options.width + 'px';
                this._container.style.height = this.options.height + 'px';
                this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
                this.link.style.width = "19px";
                this.link.style.height = "19px";
            }
            else {
                this._container.style.display = 'block';
            }
            this._minimized = false;
        },

        _onMainMapMoved: function (e) {
            if (!this._miniMapMoving) {
                this._mainMapMoving = true;
                this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
                this._setDisplay(this._decideMinimized());
            } else {
                this._miniMapMoving = false;
            }
            this._aimingRect.setBounds(this._mainMap.getBounds());
        },

        _onMainMapMoving: function (e) {
            this._aimingRect.setBounds(this._mainMap.getBounds());
        },

        _onMiniMapMoveStarted: function (e) {
            var lastAimingRect = this._aimingRect.getBounds();
            var sw = this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
            var ne = this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
            this._lastAimingRectPosition = { sw: sw, ne: ne };
        },

        _onMiniMapMoving: function (e) {
            if (!this._mainMapMoving && this._lastAimingRectPosition) {
                this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw), this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
                this._shadowRect.setStyle({ opacity: 1, fillOpacity: 0.3 });
            }
        },

        _onMiniMapMoved: function (e) {
            if (!this._mainMapMoving) {
                this._miniMapMoving = true;
                this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
                this._shadowRect.setStyle({ opacity: 0, fillOpacity: 0 });
            } else {
                this._mainMapMoving = false;
            }
        },

        _decideZoom: function (fromMaintoMini) {
            if (!this.options.zoomLevelFixed) {
                if (fromMaintoMini)
                    return this._mainMap.getZoom() + this.options.zoomLevelOffset;
                else {
                    var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
                    var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
                    var toRet;

                    if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
                        //This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
                        if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
                            //This means the user is trying to zoom in by using the minimap, zoom the main map.
                            toRet = this._mainMap.getZoom() + 1;
                            //Also we cheat and zoom the minimap out again to keep it visually consistent.
                            this._miniMap.setZoom(this._miniMap.getZoom() - 1);
                        } else {
                            //Either the user is trying to zoom out past the mini map's min zoom or has just panned using it, we can't tell the difference.
                            //Therefore, we ignore it!
                            toRet = this._mainMap.getZoom();
                        }
                    } else {
                        //This is what happens in the majority of cases, and always if you configure the min levels + offset in a sane fashion.
                        toRet = proposedZoom;
                    }
                    this._lastMiniMapZoom = this._miniMap.getZoom();
                    return toRet;
                }
            } else {
                if (fromMaintoMini)
                    return this.options.zoomLevelFixed;
                else
                    return this._mainMap.getZoom();
            }
        },

        _decideMinimized: function () {
            if (this._userToggledDisplay) {
                return this._minimized;
            }

            if (this.options.autoToggleDisplay) {
                if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
                    return true;
                }
                return false;
            }

            return this._minimized;
        },
        hidden: function () {
            $(this._container).hide();
        },
        shower: function () {
            $(this._container).show();
        }
    });

    return L.dci.minimap = function (options) {
        return new L.DCI.Controls.MiniMap(options);
    };
});




