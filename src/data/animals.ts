export type WeatherType = 'sunny' | 'rainy';

export interface AnimalWord {
  id: string;
  word: string;
  chinese: string;
  phonetic: string;
  weather: WeatherType;
  sentence: string;
  funFact: string;
  accentBg: string;
  accentText: string;
}

export const ANIMAL_WORDS: AnimalWord[] = [
  // Sunny Day Animals (6)
  {
    id: 'bee',
    word: 'Bee',
    chinese: '小蜜蜂',
    phonetic: '/biː/',
    weather: 'sunny',
    sentence: 'On a sunny day, I see a busy bee.',
    funFact: 'Buzz! Bees love warm sunshine and bright flowers.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },
  {
    id: 'butterfly',
    word: 'Butterfly',
    chinese: '花蝴蝶',
    phonetic: '/ˈbʌtərflaɪ/',
    weather: 'sunny',
    sentence: 'On a sunny day, a butterfly dances in the sky.',
    funFact: 'Butterflies open their colorful wings in the sun.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },
  {
    id: 'rabbit',
    word: 'Rabbit',
    chinese: '小兔子',
    phonetic: '/ˈræbɪt/',
    weather: 'sunny',
    sentence: 'On a sunny day, a white rabbit hops on the grass.',
    funFact: 'Hop, hop! Rabbits play outside when it is sunny.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },
  {
    id: 'bird',
    word: 'Bird',
    chinese: '小鸟',
    phonetic: '/bɜːrd/',
    weather: 'sunny',
    sentence: 'On a sunny day, a little bird sings a happy song.',
    funFact: 'Tweet, tweet! Birds fly high in the sunny blue sky.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },
  {
    id: 'dog',
    word: 'Dog',
    chinese: '小狗',
    phonetic: '/dɔːɡ/',
    weather: 'sunny',
    sentence: 'On a sunny day, a friendly dog runs in the park.',
    funFact: 'Woof, woof! Dogs love chasing balls in the sunshine.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },
  {
    id: 'cat',
    word: 'Cat',
    chinese: '小猫',
    phonetic: '/kæt/',
    weather: 'sunny',
    sentence: 'On a sunny day, a cute cat naps in the warm sun.',
    funFact: 'Meow! Cats enjoy cozy warm sunbeams.',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
  },

  // Rainy Day Animals (6)
  {
    id: 'frog',
    word: 'Frog',
    chinese: '小青蛙',
    phonetic: '/frɔːɡ/',
    weather: 'rainy',
    sentence: 'On a rainy day, a green frog jumps into a puddle.',
    funFact: 'Ribbit! Frogs love cool raindrops and lily ponds.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
  {
    id: 'duck',
    word: 'Duck',
    chinese: '小鸭子',
    phonetic: '/dʌk/',
    weather: 'rainy',
    sentence: 'On a rainy day, a yellow duck swims in the water.',
    funFact: 'Quack, quack! Ducks never mind getting wet in the rain.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
  {
    id: 'fish',
    word: 'Fish',
    chinese: '小鱼',
    phonetic: '/fɪʃ/',
    weather: 'rainy',
    sentence: 'On a rainy day, a little fish blows bubbles in the pond.',
    funFact: 'Splash! Raindrops make ripples above the fish.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
  {
    id: 'turtle',
    word: 'Turtle',
    chinese: '小乌龟',
    phonetic: '/ˈtɜːrtl/',
    weather: 'rainy',
    sentence: 'On a rainy day, a turtle walks slowly by the water.',
    funFact: 'A turtle carries its own cozy shell like an umbrella!',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
  {
    id: 'snail',
    word: 'Snail',
    chinese: '小蜗牛',
    phonetic: '/sneɪl/',
    weather: 'rainy',
    sentence: 'On a rainy day, a tiny snail comes out to say hello.',
    funFact: 'Snails love damp green leaves on rainy days.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
  {
    id: 'crab',
    word: 'Crab',
    chinese: '小螃蟹',
    phonetic: '/kræb/',
    weather: 'rainy',
    sentence: 'On a rainy day, a red crab splashes near the water.',
    funFact: 'Snip, snap! Crabs love puddles and wet sand.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-800',
  },
];

export const SUNNY_ANIMALS = ANIMAL_WORDS.filter((a) => a.weather === 'sunny');
export const RAINY_ANIMALS = ANIMAL_WORDS.filter((a) => a.weather === 'rainy');
