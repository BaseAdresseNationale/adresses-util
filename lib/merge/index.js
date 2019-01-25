
const {outputJson} = require('fs-extra')
const {flatten, chain, pick, first, groupBy, uniq} = require('lodash')
const {slugify, computeAverageIntersectDistance, compareNomVoieOverlap, compareNomVoieFuzzy, createPseudoCodeVoieGenerator} = require('../voies')
const {rewriteSuffixes} = require('../numeros')
const {getNomCommune} = require('./cog')

const NOM_VOIE_PRIORITY = {
  bal: 5,
  ban: 4,
  cadastre: 3,
  bano: 2,
  ftth: 1
}

function selectByPriority(values, priorityMap) {
  if (Object.keys(values).length === 0) {
    return
  }
  return chain(values)
    .toPairs()
    .map(([source, value]) => ({source, value}))
    .maxBy(({source}) => priorityMap[source])
    .value()
    .value
}

function computePositionProps(positions) {
  if (positions.bal) {
    return {...positions.bal, positionSource: 'bal'}
  }
  if (positions.ban) {
    return {...positions.ban, positionSource: 'ban'}
  }
  if (positions.cadastre && positions.cadastre.positionType === 'entrée') {
    return {...positions.cadastre, positionSource: 'cadastre'}
  }
  if (positions.bano) {
    return {...positions.bano, positionSource: 'bano'}
  }
  if (positions.ftth) {
    return {...positions.ftth, positionSource: 'ftth'}
  }
  if (positions.cadastre) {
    return {...positions.cadastre, positionSource: 'cadastre'} // Centre de parcelle
  }
  return {}
}

function getNomsVoie(adressesVoie) {
  return uniq(adressesVoie.map(a => a.nomVoie))
}

function computeGroups(adressesCommune) {
  const {wCodeVoie, woCodeVoie} = groupBy(adressesCommune, a => a.codeVoie ? 'wCodeVoie' : 'woCodeVoie')
  const voiesFantoir = chain(wCodeVoie)
    .groupBy('codeVoie')
    .map((adressesVoie, codeVoie) => {
      const id = `fantoir-${codeVoie}`
      return {id, groupId: id, adresses: adressesVoie}
    })
    .value()
  const voiesSansFantoir = chain(woCodeVoie)
    .groupBy(a => slugify(a.nomVoie))
    .map((adressesVoie, slug) => {
      const id = `slug-${slug}`
      return {id, groupId: id, adresses: adressesVoie}
    })
    .value()
  const voies = [...voiesSansFantoir, ...voiesFantoir]

  // Appariement spatial et typographique
  voiesSansFantoir.forEach(voieSansFantoir => {
    const nomVoieActuelle = first(voieSansFantoir.adresses).nomVoie // Les adresses sont groupés par nom de voie donc pas de risque ici
    const matchResult = voies
      .filter(v => v.id !== voieSansFantoir.id) // On ne compare pas une voie avec elle-même
      .map(v2 => ({voie: v2, averageIntersectDistance: computeAverageIntersectDistance(voieSansFantoir.adresses, v2.adresses)})) // Calcul de la distance moyenne
      .filter(m => m.averageIntersectDistance > -1) // On ne garde que celles qui matchent
      .filter(m => {
        const nomsVoie = getNomsVoie(m.voie.adresses)
        const result = m.averageIntersectDistance <= 0.01 ||
        (m.averageIntersectDistance <= 0.05 && nomsVoie.some(nomVoie => compareNomVoieOverlap(nomVoieActuelle, nomVoie))) ||
        nomsVoie.some(nomVoie => compareNomVoieFuzzy(nomVoieActuelle, nomVoie))
        return result
      }) // On garde si c'est très proche ou si le libellé est proche
    if (matchResult.length > 0) {
      const groupsToMerge = uniq([voieSansFantoir.groupId, ...(matchResult.map(result => result.voie.groupId))])
      voies.forEach(voie => {
        if (groupsToMerge.includes(voie.groupId)) {
          voie.groupId = groupsToMerge[0]
        }
      })
    }
  })

  return flatten(voies.map(({groupId, adresses}) => adresses.map(a => ({...a, groupId}))))
}

const SOURCES_LOADERS = {
  ban: require('./sources/ban'),
  bano: require('./sources/bano'),
  bal: require('./sources/bal'),
  cadastre: require('./sources/cadastre'),
  ftth: require('./sources/ftth')
}

async function merge(options) {
  const {departement, sources} = options
  console.log(`Préparation du département ${departement}`)

  const incomingAdresses = sources.map(s => {
    return SOURCES_LOADERS[s](options[`${s}Path`])
  })

  const adresses = flatten(await Promise.all(incomingAdresses)).filter(a => {
    // Suppression des adresses sans numéro
    if (!a.numero) {
      return false
    }
    // Suppression des pseudo-adresses
    const parsedNumero = Number.parseInt(a.numero, 10)
    if (parsedNumero === 0 || parsedNumero > 5000) {
      return false
    }
    return true
  })

  const voies = []

  const adressesCommunes = groupBy(adresses, 'codeCommune')

  Object.keys(adressesCommunes).forEach(codeCommune => {
    const pseudoCodeVoieGenerator = createPseudoCodeVoieGenerator()
    const adressesInitiales = adressesCommunes[codeCommune]
    const adressesWithGroups = computeGroups(adressesInitiales)
    const consolidatedVoies = chain(adressesWithGroups)
      .groupBy('groupId')
      .map(adresses => {
        /* Noms voie */

        const nomsVoie = chain(adresses)
          .groupBy('source')
          .mapValues((sourceAdresses => {
            return chain(sourceAdresses)
              .countBy('nomVoie')
              .toPairs()
              .sortBy(([, count]) => -count)
              .value()[0][0]
          }))
          .value()

        const nomVoie = selectByPriority(nomsVoie, NOM_VOIE_PRIORITY)

        /* Codes voie */

        const codesVoie = chain(adresses)
          .map('codeVoie')
          .compact()
          .uniq()
          .sort()
          .value()

        if (codesVoie.length === 0) {
          codesVoie.push(pseudoCodeVoieGenerator.create())
        }

        const codeVoie = first(codesVoie)

        /* Identifiant voie */

        const idsVoie = codesVoie.map(codeVoie => `${codeCommune}-${codeVoie}`)
        const idVoie = first(idsVoie)

        const sources = chain(adresses).map('source').uniq().value()
        const nomCommune = getNomCommune(codeCommune)

        const numeros = chain(adresses)
          .groupBy(a => `${a.numero}${a.suffixe ? a.suffixe.charAt(0).toLowerCase() : ''}`)
          .map(numeroAdresses => {
            const positions = chain(numeroAdresses)
              .filter(a => a.position)
              .groupBy('source')
              .mapValues(sourceAdresses => ({
                position: sourceAdresses[0].position,
                positionType: sourceAdresses[0].positionType
              }))
              .value()

            const suffixe = numeroAdresses[0].suffixe ?
              numeroAdresses[0].suffixe.charAt(0).toLowerCase() :
              undefined

            const {position, positionSource, positionType} = computePositionProps(positions)

            return {
              numero: numeroAdresses[0].numero,
              suffixe,
              sources: chain(numeroAdresses).map('source').uniq().value(),
              positions,
              position,
              positionType,
              positionSource,
              originalEntries: numeroAdresses
            }
          })
          .value()

        rewriteSuffixes(numeros)

        numeros.forEach(n => {
          n.id = `${idVoie}-${n.numero}${n.suffixe || ''}`.toUpperCase()
        })

        return {
          idVoie,
          codeVoie,
          nomVoie,
          codeCommune,
          nomCommune,
          sources,
          numeros,
          codesVoie,
          idsVoie,
          nomsVoie
        }
      })
      .value()

    consolidatedVoies.forEach(v => voies.push(v))
  })

  await outputJson(`dist/adresses-ouvertes-${departement}.geojson`, {
    type: 'FeatureCollection',
    features: chain(voies)
      .map(voie => voie.numeros.map(n => ({
        ...voie,
        ...n
      })))
      .flatten()
      .filter(a => a.position)
      .map(a => ({
        type: 'Feature',
        properties: pick(a, 'numero', 'suffixe', 'codeVoie', 'nomVoie', 'codeCommune', 'nomCommune', 'sources', 'positionSource', 'positionType', 'id'),
        geometry: a.position
      }))
  })
}

module.exports = merge
