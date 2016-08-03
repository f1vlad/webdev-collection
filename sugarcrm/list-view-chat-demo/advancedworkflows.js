$(document).ready(function() {

    var origin_point,
        linking_active = false,
        link_active_from,
        link_active_to,
        awDesignerSave;

    //reposition_line();
    setTimeout(function(){
        reposition_line();
        //
    }, 2100);

    $(".draggable").draggable({
        cursor: "pointer",
        containment: "parent",
        helper: "original",
        drag: function() {
            reposition_line();
        },
        stop: function() {
            $(this).addClass('dragged');
            clean_cloned_draggable();
            dragdrop_assign_id();
        }
    });

    $(".advanced-workflows-toolbox-inventory .droppable").draggable({
        helper: "clone",
        snap: true,
        stop: function(){
            $(this).addClass('dragged');
            aw_designer_touched(true);
        },
    });

    $(".advanced-workflows-toolbox-inventory .droppable, .advanced-workflows-workarea-pad").droppable({
        cursor: "pointer",
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function(event, ui) {
            var data = $(ui.draggable[0]).find('data'),
                file = data.attr('file'),
                title = data.attr('title'),
                applies_to = data.attr('applies_to'),
                criteria = data.attr('criteria'),
                icon_type= data.attr('icon_type'),
                awti_id = 'awti-id-' + Math.floor(Math.random() * 10000000);
            $('\
                <span style="left: ' + (event.originalEvent.clientX -20) + 'px; top: ' + (event.originalEvent.clientY - 110) + 'px" id="' + awti_id + '" icon-type="'+icon_type+'" class="awti-item dragged new draggable to-active ' + icon_type  + '" data-title="' + title + '" data-applies_to="' + applies_to + '" data-criteria="' + criteria + '">\
                <embed src="include/svg/' + file + '.svg" type="image/svg+xml" class="svg">\
                </i>\
                <span class="decoration">\
                    <span class="hover">\
                        <span id=' + icon_type + Math.floor(Math.random() * 10000000) + ' index="1"></span>\
                        <span id=' + icon_type + Math.floor(Math.random() * 10000000) + ' index="2"></span>\
                        <span id=' + icon_type + Math.floor(Math.random() * 10000000) + ' index="3"></span>\
                        <span id=' + icon_type + Math.floor(Math.random() * 10000000) + ' index="4"></span>\
                    </span>\
                </span>\
                </span>\
            ')
            .appendTo(this);

            setTimeout(function(){
                $('.awti-item.to-active').removeClass('to-active').trigger('click');
            }, 601);

            $('.awti-item.expandable.active').removeClass('active');

            line_connections_redraw(event.toElement.id);

            draggify_new_item();
            aw_designer_touched(true);
        }
    });

    function aw_designer_touched(va) {
        $('[ref=awLastEdited]').html('You have unsaved changes');

        setTimeout(function(){
            $('[ref=awLastEdited]').html('All changes saved');
        },
        5000);
    }

    function clean_cloned_draggable() {
        $('.advanced-workflows-workarea-pad .awti-item:not(.dragged)').remove();
        return false;
    }

    function draggify_new_item() {
        $('.new.draggable')
            .removeClass('new')
            .draggable({
                stop: function(event, ui) {
                    $(this).addClass('dragged');
                    $(this).closest('.advanced-workflows-workarea-pad').find('span[data-title=undefined]').remove();
                    dragdrop_assign_id();
                }
            });
    }

    function dragdrop_assign_id() {
        $('.advanced-workflows-workarea-pad .dragged').each(function(){
            if($(this).attr('id') == undefined) {
                $(this).attr('id', 'd' + Math.floor(Math.random() * 10000000));
            }
        });
    }

    function reposition_line(){

        return false; // disabled

        var line = $('#line'),
            sx1 = $('.draggable').eq(0).position().left,
            sy1 = $('.draggable').eq(0).position().top,
            sx2 = $('.draggable').eq(1).position().left,
            sy2 = $('.draggable').eq(1).position().top,
            diff = 30;

        line
            .attr('x1', sx1 + diff)
            .attr('y1', sy1 + diff)
            .attr('x2', sx2 + diff)
            .attr('y2', sy2 + diff);
    }

    function line_connections_redraw(t){
        $('#' + t).find('.hover > span').each(function(){
            if($(this).hasClass('bound') == true) {
                var id = $(this).attr('id'),
                    bound_to = $(this).attr('bound-to');

                // redraw line by id:
                reposition_line_by_id(bound_to);

            }
        });
    }

    function reposition_line_by_id(id){

        var firstEl = $('[bound-to=' + id + ']').eq(0).closest('.awti-item'),
            secondEl = $('[bound-to=' + id + ']').eq(1).closest('.awti-item'),
            firstElIndex = $('[bound-to=' + id + ']').eq(0).attr('index'),
            secondElIndex = $('[bound-to=' + id + ']').eq(1).attr('index'),
            arr1 = $('#arr-1-' + id),
            arr2 = $('#arr-2-' + id),
            polygon = $('#polygon-' + id),
            polygon_correction = 90,
            diffLeft = 0,
            diffTop = 0;

        if(firstElIndex == 2) {
            diffLeft = -20;
            diffTop = 0;
        } else if (firstElIndex == 1) {
            diffLeft = 0;
            diffTop = -20;
        } else if (firstElIndex == 3) {
            diffLeft = + 20;
            diffTop = 0;
        } else if (firstElIndex == 4) {
            diffLeft = 0;
            diffTop = + 20;
        }

        var line = $('#' + id),
            sx1 = firstEl.position().left + diffLeft,
            sy1 = firstEl.position().top + diffTop;

        if(secondElIndex == 2) {
            diffLeft = -20;
            diffTop = 0;
        } else if (secondElIndex == 1) {
            diffLeft = 0;
            diffTop = -20;
        } else if (secondElIndex == 3) {
            diffLeft = + 20;
            diffTop = 0;
        } else if (secondElIndex == 4) {
            diffLeft = 0;
            diffTop = + 20;
        }

        var sx2 = secondEl.position().left + diffLeft,
            sy2 = secondEl.position().top + diffTop,
            diff = 26;

        line
            .attr('x1', sx1 + diff)
            .attr('y1', sy1 + diff)
            .attr('x2', sx2 + diff)
            .attr('y2', sy2 + diff);

        // 46 x 46

        var polygon_demo_only_correction = - 8;

        polygon
            .css('top', sy2 + 18)
            .css('left', sx2 + 21 + polygon_demo_only_correction)
            .css('transform', 'rotate(' + (Math.atan2(sy2 - sy1, sx2 - sx1) * 180 / Math.PI + polygon_correction) + 'deg)');

        //console.log(Math.atan2(sy2 - sy1, sx2 - sx1) * 180 / Math.PI);
    }

    function linkMouseMoveEvent(event) {
        if($('#new-link-line').length > 0) {
            var originX = $('#' + origin_point).offset().left + $('#' + origin_point).outerWidth() / 2,
                originY = $('#' + origin_point).offset().top + $('#' + origin_point).outerHeight() / 2,
                length = Math.sqrt((event.pageX - originX) * (event.pageX - originX) + (event.pageY - originY) * (event.pageY - originY)),
                angle = 180 / 3.1415 * Math.acos((event.pageY - originY) / length);
            if(event.pageX > originX) angle *= -1;
            $('#new-link-line').css('height', length).css('transform', 'rotate(' + angle + 'deg)');

            linking_active = true;
            $('.advanced-workflows-workarea-pad').addClass('linking-active');
        }
    }

    function endLinkMode(event) {
        $('#new-link-line').remove();
        $(document).unbind('mousemove.link').unbind('click.link').unbind('keydown.link');

        setTimeout(function(){
            $('.advanced-workflows-workarea-pad').removeClass('linking-active');
            linking_active = false;
        }, 300)
    }

    function toggleContext(v){
        if(v) {
            $('.advanced-workflows-workarea').addClass('context-shown');
            return false;
        }
        $('.advanced-workflows-workarea').toggleClass('context-shown');
    }

    function updateContextMenu(el, title, applies_to, criteria, id){
        $('.advanced-workflows-workarea-context input#context-title').prop('value', title);
        $('.advanced-workflows-workarea-context input#context-applies-to').prop('value', applies_to);
        $('.advanced-workflows-workarea-context textarea#context-criteria').val(criteria);
        $('.advanced-workflows-workarea-context').attr('data-active-id', id);
        toggleContext(true);
    }

    function make_line_connection(from, to, e) {

        //console.log('establishing a link from ' + from + ' to ' + to);
        var lineId = 'line' + from + to,
            line = $('<svg height="100%" width="100%" style="position: absolute;top: 0;left: 0;">\
                            <line id="' + lineId + '" style="stroke:rgb(151,151,151);stroke-width:3"></line>\
                            <line id="arr-1-' + lineId + '" style="stroke:rgb(151,151,151);stroke-width:3"></line>\
                            <line id="arr-2-' + lineId + '" style="stroke:rgb(151,151,151);stroke-width:3"></line>\
                        </svg>\
                        <embed style="z-index: 1000;width: 10px;position:absolute" id="polygon-' + lineId + '" src="include/svg/triangle_new.svg" type="image/svg+xml" class="svg">\
                        ');

            // x1="201" y1="101" x2="216" y2="89"
        line.prependTo('.advanced-workflows-workarea-pad');
        $('#' + from + ', #' + to).addClass('bound').attr('bound-to', lineId);
        reposition_line_by_id(lineId);
    }

    $(document).on('click', '[ref=awtiItemButtonClose]', function(){
        $(this).closest('.awti-item').remove();
        return false;
    });

    $(document).on('click', '.awti-item.dragged', function(){
        $('.awti-item.active').removeClass('active');
        $(this).addClass('active');

        if($(this).attr('icon-type') == "diamond") {
            $('.advanced-workflows-workarea-context.non-diamond').addClass('hidden');
            $('.advanced-workflows-workarea-context.diamond').removeClass('hidden');
        } else {
            $('.advanced-workflows-workarea-context.non-diamond').removeClass('hidden');
            $('.advanced-workflows-workarea-context.diamond').addClass('hidden');
        }

        updateContextMenu($(this), $(this).attr('data-title'), $(this).attr('data-applies_to'), $(this).attr('data-criteria'), $(this).attr('id'));
        return false;
    });

    $(document).on('click', '.awti-item.expandable', function(){
        $(this).toggleClass('active');
        return false;
    });

    $(document).on('click', '[ref=toggleAWcontext]', function(){
        toggleContext();
        return false;
    });

    $(document).on('click', '[ref=AWcontextDelete]', function(){
        var idToDel = $(this).closest('.advanced-workflows-workarea-context').attr('data-active-id');
        $('#' + idToDel).remove();
        handle_alert(true, 'success', true, "Success", "item has been deleted");
        toggleContext();
        return false;
    });

    $(document).on('click', '[ref=AWcontextSave]', function(){
        var idToSav = $(this).closest('.advanced-workflows-workarea-context').attr('data-active-id');
        $('#' + idToSav).attr({
            'data-title': $('.advanced-workflows-workarea-context #context-title').prop('value'),
            'data-applies_to': $('.advanced-workflows-workarea-context #context-applies-to').prop('value'),
            'data-criteria': $('.advanced-workflows-workarea-context #context-criteria').prop('value')
        });
        handle_alert(true, 'success', true, "Success", "item modifications have been saved");
        return false;
    });

    $(document).on('click', '#routeAdvancedWorkflows [ref=makeAwDrawer]', function(){
        $('#drawers [ref=drawerAwCreate]').toggleClass('hidden');
        $('<div id="transparent-mask" />').appendTo('#sidecar');
        $('body').addClass('drawer-active');
    });

    $(document).on('click', '#routeAdvancedWorkflowsDesigner [ref=awDoneBtn]', function(){
        $('#drawers [ref=awDoneModal]').toggleClass('hidden');
        $('<div id="transparent-mask" />').appendTo('#sidecar');
        $('body').addClass('drawer-active');
    });

    $(document).on('click', '[ref=awDoneModal] [ref=awDesignerModalIgnore]', function(){

        handle_alert(true, 'loading', true, "loading", "Loading");

        awDesignerSave = $('.advanced-workflows-workarea').html();
        $(awDesignerSave).find('.advanced-workflows-workarea-context')

        setTimeout(function(){
            $('#routeAdvancedWorkflows, #routeAdvancedWorkflowsDesigner').toggleClass('hidden');
        }, 1000);

        setTimeout(function(){
            $('#transparent-mask').trigger('click');
            $('#alerts .alert-wrapper').remove();
            handle_alert(true, 'success', true, "Success", "You have successfully created <a ref='awRecordView' href='#'>" + $('[ref=awName]').html() + "</a>");


            // insert a row into list view
            fake_flexlist_add_rows(1, $('#routeAdvancedWorkflows').find('.flex-list-view'), 900);

            // alter #opportunities list view to be relevant to advanced workflow list view
            setTimeout(function(){
                fake_flexlist_aw_relevant();
            }, 1000);
        }, 1300);
    });

    $(document).on('click', '[ref=awRecordView]', function(){
        handle_alert(true, 'loading', true, "loading", "Loading");
        setTimeout(function(){
            console.log(awDesignerSave);
            $('.aw-designer-preview').html(awDesignerSave);
            $('#alerts .alert-wrapper').remove();
        },
        2000);
    });

    $(document).on('click', '[ref=awDoneModal] [ref=awDesignerModalBack]', function(){
        $('#transparent-mask').trigger('click');
    });

    $(document).on('click', '.advanced-workflows-workarea-pad.linking-active .awti-item .decoration .hover > span[id]', function(event){
        link_active_to = event.target.id;
        //console.log('ESTABLISH link from: ' + link_active_from + ' — to: ' + link_active_to);

        make_line_connection(link_active_from, link_active_to);
    });

    $(document).on('click', '[ref=nextAw]', function(){

        var awName = $('input[ref=awName]').val(),
            awTargetModule = $('input[ref=awTargetModule]').val(),
            awAssignedTo = $('input[ref=awAssignedTo]').val();

        if(awName == '') {
            awName = 'Untitled';
        }

        $('span[ref=awName]').html(awName);
        $('span[ref=awTargetModule]').html(awTargetModule);

        $('#routeAdvancedWorkflows').addClass('roll-off-screen');
        $('#routeAdvancedWorkflowsDesigner').removeClass('hidden').addClass('roll-to-screen');

        handle_alert(true, 'loading', true, "loading", "Loading");

        setTimeout(function(){
            $('#routeAdvancedWorkflows').addClass('hidden').removeClass('roll-off-screen');
        },
        1200);

        setTimeout(function(){
            $('#transparent-mask').trigger('click');
            $('#alerts .alert-wrapper').remove();
        }, 1300);

    });

    $(document).on('click', '.advanced-workflows-workarea-pad:not(.linking-active) .awti-item .decoration .hover > span[id]', function(event){
        link_active_from = event.target.id;
        var linkLine = $('<div id="new-link-line"></div>').appendTo('body');
        origin_point = event.target.id;
        linkLine.css('top', $('#' + origin_point).offset().top + $('#origin-point').outerWidth() / 2).css('left', $('#' + origin_point).offset().left + $('#' + origin_point).outerHeight() / 2);
        $(document).mousemove(linkMouseMoveEvent);
        $(document).bind('mousedown.link', function(event) {
            if(event.which == 1) {
                endLinkMode(event);
            }
        });
    });

    $(document).on('click', '[ref=awModalable]', function(e){
        var modalContents = $(this).html();
        $('#drawers [ref=awDesignerPreview] .awDesignerPreviewContent').html(modalContents);
        $('#drawers [ref=awDesignerPreview]').toggleClass('hidden');
        $('<div id="transparent-mask" />').appendTo('#sidecar');
        $('body').addClass('drawer-active');
    })
});

function fake_flexlist_aw_relevant() {
    var sel = $('#routeAdvancedWorkflows');

    sel.find('th[data-type=account] span').html('Target Module');
    sel.find('tbody tr:first-child td[data-type=account] .ellipsis_inline').html('Leads');
    sel.find('tbody tr:not(:first-child) td[data-type=account] .ellipsis_inline').html('Accounts');

    sel.find('th[data-type=sales-stage] span').html('Status');
    sel.find('tbody tr td[data-type=sales-stage] .ellipsis_inline').html('<span class="label ellipsis_inline label-important" rel="tooltip" data-placement="bottom" title="" data-original-title="Disabled">Disabled</span>');

    sel.find('tbody tr:not(:first-child) td[data-type=name] .ellipsis_inline > a').html($('[ref=awName]').html()).attr('ref', 'awRecordView');

    sel.find('tbody tr td[data-type=name] .ellipsis_inline > a').attr('ref', 'awRecordView');



    sel.find('[data-type=likelihood], [data-type=lead-source], [data-type=probability], [data-type=user], [data-type=email]').addClass('hidden');
    sel.find('th').attr('style', '');

    sel.find('table').removeClass('hidden');

}
