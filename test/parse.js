var ParseConformance = require('../parseConformance');
var assert = require('assert');
var _ = require('underscore');

describe('Parse', function () {
    it('should load parsed structure definitions and value sets from cache/file', function () {
        var parser = new ParseConformance(true);

        assert(parser.parsedStructureDefinitions);
        assert(Object.keys(parser.parsedStructureDefinitions).length === 204);
        assert(Object.keys(parser.parsedValueSets).length === 555);
    });

    it('should parse bundles', function () {
        var types = require('../profiles/r4/profiles-types.json');
        var resources = require('../profiles/r4/profiles-resources.json');
        var valueSets = require('../profiles/r4/valuesets.json');

        var parser = new ParseConformance(false);
        parser.parseBundle(valueSets);
        parser.parseBundle(types);
        parser.parseBundle(resources);

        assert(parser.parsedStructureDefinitions);
        var structureDefinitionsCount = Object.keys(parser.parsedStructureDefinitions).length;
        assert(structureDefinitionsCount === 204);
        assert(parser.parsedValueSets);
        var valueSetsCount = Object.keys(parser.parsedValueSets).length;
        assert(valueSetsCount === 555);

        var noCodeValueSets = _.filter(parser.parsedValueSets, function(valueSet) {
            var systemHasCodes = false;

            _.each(valueSet.systems, function(system) {
                if (system.codes && system.codes.length >= 0) {
                    systemHasCodes = true;
                }
            });

            return !systemHasCodes;
        });

        assert(noCodeValueSets.length === 0);   // All value sets have at least one code
    });

    it('should parse profile-StructureDefinition for STU3', function() {
        var sdProfile = require('./data/stu3/schema/profile-StructureDefinition.json');
        var parser = new ParseConformance(false, ParseConformance.VERSIONS.STU3);
        parser.parseStructureDefinition(sdProfile);

        var parsedStructureDefinition = parser.parsedStructureDefinitions['StructureDefinition'];
        assert(parsedStructureDefinition);
        assert(parsedStructureDefinition._properties);
        assert(parsedStructureDefinition._properties.length === 36);

        var parsedDifferential = parsedStructureDefinition._properties[35];
        assert(parsedDifferential._name === 'differential');
        assert(parsedDifferential._properties);
        assert(parsedDifferential._properties.length === 4);

        var parsedDifferentialElement = parsedDifferential._properties[3];
        assert(parsedDifferentialElement);
        assert(parsedDifferentialElement._properties);
        assert(parsedDifferentialElement._properties.length === 0);
        assert(parsedDifferentialElement._type === 'ElementDefinition');
    });

    it('should parse bundles for STU3', function() {
        var types = require('./data/stu3/schema/profiles-types.json');
        var resources = require('./data/stu3/schema/profiles-resources.json');

        var parser = new ParseConformance(false, ParseConformance.VERSIONS.STU3);
        parser.parseBundle(types);
        parser.parseBundle(resources);

        assert(parser.parsedStructureDefinitions);

        var sdKeys = Object.keys(parser.parsedStructureDefinitions);
        assert(sdKeys.length === 173);

        var parsedAddress = parser.parsedStructureDefinitions['Address'];
        assert(parsedAddress);
        assert(parsedAddress._properties);
        assert(parsedAddress._properties.length === 12);
        assert(parsedAddress._properties[2]._name === 'use');
        assert(parsedAddress._properties[2]._type === 'code');
        assert(parsedAddress._properties[2]._valueSet === 'http://hl7.org/fhir/ValueSet/address-use');
        assert(parsedAddress._properties[2]._valueSetStrength === 'required');

        // TODO: Should have more unit tests to verify that parsing STU3 resources works properly
    });
});