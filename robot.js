var mobile = !!$('#mobile').html(),
    quiz = document.querySelector('.jjo-display'),
    $topic = $('.jjo-turn-time'),
    $chat = $('[id^=UserMessage]');
var slave = new MutationObserver(manual),
    config = {attributes: false, childList: true, subtree: true};
var enter = $.Event('keydown', {keyCode: 13});
var autoMode = false;
var quizNum = 0,
    wordNum = 0;

$('head').append('<link rel="stylesheet" href="https://raw.githack.com/Rosantex/kkutu/master/robot.css">');
$(`<label class="toggle-check">Auto&nbsp
    <input type="checkbox" id="toggle-auto" class="toggle-check-input">
    <span class="toggle-check-text"></span>
</label>`).insertAfter('#dict-search');
$(document).off('paste')
           .on('click', '.answer', function(e) {
               inputWord($(this).prop('class', 'used').text());
           })
           .on('mousedown', '.used', function(e) {
               e.button == 2 && inputWord($(this).text());
           });
$('#dict-input').off('keydown')
                .keydown(function(e) {
                    e.keyCode == 13 && searchWord($(this).val(), '', true);
                });
$('#toggle-auto').change(function(e) {
    autoMode = $(this).prop('checked');
});
$('#DictionaryDiag').fadeIn(500);

slave.observe(quiz, config);

Notification.requestPermission();

function manual() {
    var topic = $topic.text().match(/(?<=주제:\s).+/)[0].replace(/\//g, ' ');

    searchWord(quiz.textContent, topic, false);

    autoMode && $('.room-head-title').text(`${wordNum} / ${quizNum} (성능: ${Math.floor((1 - (wordNum / quizNum || 0)) * 1000) / 10}%)`);
}

function searchWord(text, topic, isManualInput) {
    if (/[ㄱ-ㅎ]/.test(text)) {
        $.post({
            url: 'http://kkutu.dothome.co.kr/search_word.php',
            data: {'topic': topic, 'quiz': text}
        }).done(function(res) {
            var answers = JSON.parse(res);

            if (answers) {
                var answerList = '';
                for (let answer of answers)
                    answerList += `<li class="answer">${answer}</li>`;

                $('#dict-output').html(`<ul>${answerList}</ul>`);
            }

            autoMode && answers && inputWord(answers[~~(Math.random() * answers.length)])
        });

        !isManualInput && quizNum++;
    } else if (!isManualInput && /^[가-힣0-9]+$/.test(text)) {
        $.post({
            url: 'http://kkutu.dothome.co.kr/add_word.php',
            data: {'topic': topic, 'word': text}
        }).done(function(message) {
            message && ++wordNum && notify(message);
        });
    } else if (text === '게임 끝!') {
        autoMode && setTimeout(function() {
            $('#result-ok').click();
            $('#result-ok').click();
            $('#practice-ok').click();
        }, 300);
    }
}

function notify(msg) {
    if (Notification.permission === 'granted') {
        var alarm = new Notification('DB에 단어가 추가되었습니다', {
            icon: 'http://kkutu.dothome.co.kr/img/added_icon.png',
            body: msg
        });

        setTimeout(alarm.close.bind(alarm), 1500);
    }
}

function inputWord(word) {
    $chat.val(word).trigger(enter);
}
