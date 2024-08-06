var fs = require('fs');

exports.iterateFiles = function(dir, filename_re, cb) {

    var count = 0;
    var current_file_idx = 0;

    function processFile(filepath, count_files) {
        if (!filename_re.test(filepath)) {
            return;
        }
        if (count_files) {
            count++;
        } else {
            current_file_idx++;

            var log_step = Math.round(count / 10);

            if (current_file_idx % log_step === 0) {
                console.log('- Progress', Math.round(100 * current_file_idx / count) + '%', current_file_idx, 'of', count)
            }

            var content = fs.readFileSync(filepath, 'utf8');

            cb({
                filename: filepath,
                content: content
            });
        }
    }
    
    function processDir(start, count_files) {
        fs.readdirSync(start).forEach(file => {
            var path = start + '/' + file;
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                processDir(path, count_files);
            } else {
                processFile(path, count_files);
            }
        });
    }
    
    processDir(dir, true);
    processDir(dir);
}