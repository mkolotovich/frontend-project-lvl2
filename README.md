# JavaScript Проект - «Вычислитель отличий»
## Описание
Вычислитель отличий – программа, определяющая разницу между двумя структурами данных. Это популярная задача, для решения которой существует множество онлайн сервисов, например http://www.jsondiff.com/. Подобный механизм используется при выводе тестов или при автоматическом отслеживании изменении в конфигурационных файлах.

Возможности утилиты:

* Поддержка разных входных форматов: yaml, json
* Генерация отчета в виде plain text, stylish и json

## Установка приложения и запуска игр
1. Убедитесь, что у вас установлена Node.js версии 13 и выше. В противном случае установите Node.js версии 13 и выше.
2. Установите пакет в систему с помощью npm link и убедитесь в том, что он работает, запустив gendiff -h в терминале. Команду npm link необходимо запускать из корневой директории проекта.
3. Пример использования:
  * формат plain - $ gendiff --format plain path/to/file.yml another/path/file.json
  * формат stylish - $ gendiff filepath1.json filepath2.json

### Hexlet tests and linter status:
[![Actions Status](https://github.com/mkolotovich/frontend-project-lvl2/workflows/hexlet-check/badge.svg)](https://github.com/mkolotovich/frontend-project-lvl2/actions)
[![Actions Status](https://github.com/mkolotovich/frontend-project-lvl2/actions/workflows/ESLint&tests.yml/badge.svg)](https://github.com/mkolotovich/frontend-project-lvl2/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/f7687a3f327fe7d6db80/maintainability)](https://codeclimate.com/github/mkolotovich/frontend-project-lvl2/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/f7687a3f327fe7d6db80/test_coverage)](https://codeclimate.com/github/mkolotovich/frontend-project-lvl2/test_coverage)
[![asciicast](https://asciinema.org/a/l0l2DsCLbGOMTNgIku6pMG05D.svg)](https://asciinema.org/a/l0l2DsCLbGOMTNgIku6pMG05D)
[![asciicast](https://asciinema.org/a/ySnIqCrfGJKc7MM0Q2FEhYy22.svg)](https://asciinema.org/a/ySnIqCrfGJKc7MM0Q2FEhYy22)
[![asciicast](https://asciinema.org/a/VW9GgdgamQYTbVrfQ70vFd0AW.svg)](https://asciinema.org/a/VW9GgdgamQYTbVrfQ70vFd0AW)
[![asciicast](https://asciinema.org/a/7VzP0AcZk7odtm5pkeJGLTb17.svg)](https://asciinema.org/a/7VzP0AcZk7odtm5pkeJGLTb17)
[![asciicast](https://asciinema.org/a/kSgr2zZCBgooTdPp11nUCDhmR.svg)](https://asciinema.org/a/kSgr2zZCBgooTdPp11nUCDhmR)