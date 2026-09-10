/**
 * Testimonials — User review cards.
 * Inspired by ziyouzt.com testimonials section.
 */
const REVIEWS = [
  { text: '周末给孩子打印了汉字描红帖，田字格很清晰，孩子练字兴趣明显提高了，PDF直接打印很方便。', name: '李妈妈', role: '学生家长', avatar: '李' },
  { text: '作为语文老师，我用它快速生成生字练习帖，省去了手工画格子的时间，课堂效率提升很多。', name: '王老师', role: '小学语文教师', avatar: '王' },
  { text: '拼音字帖功能很实用，看拼音写汉字和看汉字写拼音都能生成，孩子拼音巩固效果好。', name: '张爸爸', role: '学生家长', avatar: '张' },
  { text: '英文字母四线三格打印出来很规范，大小写描红练习帮孩子养成了良好的书写习惯。', name: '陈妈妈', role: '学生家长', avatar: '陈' },
];

export default function Testimonials() {
  return React.createElement(
    'section',
    { className: 'testimonials-section' },
    React.createElement(
      'div',
      { className: 'container-narrow' },
      React.createElement(
        'div',
        { className: 'section-header' },
        React.createElement('h2', { className: 'section-title' }, '用户评价'),
        React.createElement('p', { className: 'section-subtitle' }, '来自真实用户的使用反馈')
      ),
      React.createElement(
        'div',
        { className: 'testimonials-grid' },
        REVIEWS.map((review, i) =>
          React.createElement(
            'div',
            { key: i, className: 'testimonial-card' },
            React.createElement('p', { className: 'testimonial-text' }, `“${review.text}”`),
            React.createElement(
              'div',
              { className: 'testimonial-author' },
              React.createElement('div', { className: 'testimonial-avatar' }, review.avatar),
              React.createElement(
                'div',
                null,
                React.createElement('div', { className: 'testimonial-name' }, review.name),
                React.createElement('div', { className: 'testimonial-role' }, review.role)
              )
            )
          )
        )
      )
    )
  );
}
