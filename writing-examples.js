const writingExamples = [
  {
    theme: 'beach',
    pictures: [
      ['What did I bring?', 'I brought my sketchbook to the beach.', '📒', '🪨', 'arrive'],
      ['What happened?', 'A wave splashed it. My sketchbook got wet!', '📒', '🌊', 'splash'],
      ['What did I do next?', 'I opened my sketchbook to dry in the sun.', '📖', '☀️', 'glow'],
    ],
    choices: [
      ['What did you bring?', [['🪁', 'A kite'], ['🧸', 'A teddy'], ['🗺️', 'A treasure map']]],
      ['How did it get wet?', [['🌊', 'A wave splashed'], ['🌧️', 'Rain started'], ['🐕', 'A dog shook itself']]],
      ['What did you do next?', [['☀️', 'Dried it in the sun'], ['🧺', 'Wrapped it in a towel'], ['🙋', 'Asked for help']]],
    ],
    finish: 'Tell your story out loud. Now write two or three sentences on paper.',
  },
  {
    theme: 'garden',
    pictures: [
      ['A rainy problem', 'This snail needs a dry place to hide.', '🐌', '🌧️', 'splash'],
      ['What is it made of?', 'I can make a little roof from a leaf.', '🐌', '🍃', 'drop'],
      ['How does it work?', 'Drops roll off the leaf. The snail stays dry!', '🐌', '💧', 'splash'],
    ],
    choices: [
      ['What could you make the roof from?', [['🍃', 'A big leaf'], ['🪵', 'A piece of bark'], ['🐚', 'A shell']]],
      ['How could it keep the snail dry?', [['💧', 'Drops roll down the sides'], ['☂️', 'The roof sticks out past the snail'], ['📐', 'A sloping roof sends rain away']]],
    ],
    finish: 'Say what your shelter is made of and how it works. Write those two ideas on paper.',
  },
  {
    theme: 'play',
    pictures: [
      ['First', 'First, draw a path around a pond.', '📝', '💧', 'arrive'],
      ['Next', 'Next, slide the toy to the bridge.', '🚗', '🌉', 'slide'],
      ['Try the steps', 'Say your instructions in order, then test them.', '🚗', '🏁', 'pop'],
    ],
    choices: [
      ['What will you do first?', [['〰️', 'Draw a twisty path'], ['🚩', 'Mark the starting spot'], ['🌉', 'Draw a bridge']]],
      ['What will you do next?', [['🏁', 'Move the toy to the flag'], ['↪️', 'Roll it around a bend'], ['🌳', 'Stop it beside a tree']]],
    ],
    finish: 'Say your steps using First and Next. Write both instructions on paper.',
  },
  {
    theme: 'park',
    pictures: [
      ['First thing I see', 'I see a red kite in the sky.', '🪁', '☁️', 'sway'],
      ['Second thing I see', 'I see a tiny bird on a branch.', '🐦', '🌳', 'arrive'],
      ['Add a detail', 'Words like red and tiny help readers picture it.', '🖍️', '✨', 'pop'],
    ],
    choices: [
      ['What could you see first?', [['☁️', 'A fluffy white cloud'], ['🍂', 'A golden leaf'], ['🌼', 'A bright yellow flower']]],
      ['What could you see next?', [['🐦', 'A bird with a long tail'], ['🐕', 'A muddy brown dog'], ['🚲', 'A shiny blue bike']]],
    ],
    finish: 'Say both ideas aloud. Write two lines beginning with “I see” and give each a detail.',
  },
  {
    theme: 'lamp',
    pictures: [
      ['What did I do?', 'I slid my toy closer to the lamp.', '🧸', '💡', 'slide'],
      ['What did I see?', 'The toy’s shadow grew bigger on the wall.', '🧸', '💡', 'shadow'],
      ['Write what changed', 'Write what you did, then what you saw.', '📝', '💡', 'pop'],
    ],
    choices: [
      ['What did you move?', [['🧸', 'Moved the toy closer to the lamp'], ['💡', 'Moved the toy away from the lamp'], ['↪️', 'Turned the toy around']]],
      ['What did you really notice?', [['🔍', 'The shadow grew bigger'], ['🤏', 'The shadow got smaller'], ['↔️', 'The shadow moved or changed shape']]],
    ],
    finish: 'Tell someone what you really saw. Write one sentence about what you did and one about what you noticed.',
  },
  {
    theme: 'garden',
    pictures: [
      ['Someone comes to the gate', 'A visitor sees a sign next to the gate.', '🚪', '🪧', 'arrive'],
      ['What should they do?', 'My sign says, “Please shut the gate.”', '🚪', '🪧', 'drop'],
      ['Why should they do it?', 'Our rabbit might hop out. That’s my reason.', '🐇', '🚪', 'pop'],
    ],
    choices: [
      ['What will you ask visitors to do?', [['🚪', 'Please shut the gate'], ['🔒', 'Please close the latch'], ['👀', 'Please check that the gate is shut']]],
      ['Why should they do it?', [['🐇', 'Our rabbit could hop out'], ['🏡', 'Our pets are safer inside'], ['🌱', 'It keeps the garden safe']]],
    ],
    finish: 'Read your idea aloud as a sign. Write one sentence asking visitors to do something and one saying why.',
  },
  {
    theme: 'park',
    pictures: [
      ['What did I bring?', 'I took my paper plane to the park.', '✈️', '🌳', 'arrive'],
      ['What happened?', 'The wind blew it right under a bench!', '✈️', '💨', 'gust'],
      ['What did I do next?', 'I picked it up and held it tight.', '✈️', '🙌', 'pop'],
    ],
    choices: [
      ['What did you bring?', [['🎈', 'A balloon'], ['🧢', 'A new cap'], ['🗺️', 'A park map']]],
      ['Where did the wind blow it?', [['🌳', 'Behind a tree'], ['🪑', 'Under a bench'], ['🌼', 'Into the flowers']]],
      ['What did you do next?', [['🙋', 'Asked for help'], ['🤲', 'Caught it with both hands'], ['🚶', 'Went around to get it']]],
    ],
    finish: 'Tell your story in order. Write two or three sentences about what you brought, what happened and what you did next.',
  },
];
