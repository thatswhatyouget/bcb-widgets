function DropLink(linkCallback) {
    linkCallback = linkCallback || console.log;
    var $dropzone = $('<div>');
    function makeDropZone() {
        if ($dropzone.is(':visible')) return;
        $dropzone = $('<textarea>').css({ position: 'fixed', width: '100%', left: '0', top: '0', right: '0', bottom: '0', opacity: .1, background: "lime" });
        $dropzone.on('mouseup', destroyDropZone).on('dragleave', destroyDropZone).on('input', destroyDropZone).on('mouseout', destroyDropZone).on('drop', destroyDropZone);
        $(document.body).append($dropzone);
    }
    function destroyDropZone(e) {
        e.preventDefault();
        var dropped = $dropzone.val().trim();
        if (!dropped) {
            var dataTransfer = e.originalEvent.dataTransfer;
            dropped = dataTransfer.getData("url") || dataTransfer.getData("text/uri-list");
        }    
        if (dropped) {
            console.log(dropped);
            linkCallback(dropped);
        }
        $dropzone.hide().remove();
    }
    $(document).on('dragover', makeDropZone).on('dragenter', makeDropZone);
}