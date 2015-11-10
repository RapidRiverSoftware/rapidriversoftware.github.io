import $ from 'jquery';
import BS from 'bootstrap';
import Avgrund from './avgrund';

function handleTeamPopups() {
  $('.team__member').on('click', function (e) {
    let $this = $(this);
    console.log(this);
    const name = $this.data('detail');
    const templatePath = `/templates/team/${name}.template.html`;

    $.ajax({
      url: templatePath,
      context: document.body,
      dataType: 'html'
    }).success((data) => {
      $('.dialog').remove();

      $(document.body)
        .prepend(`<div class="dialog avgrund-popup">${data}</div>`);

      Avgrund.show(".dialog");
    });
  });

  $(document).on('click', '.dialog-closer', function (e) {
    Avgrund.hide();
  });
}

$(() => {
  handleTeamPopups();
});
