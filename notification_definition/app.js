(function() {

  return {
    operators: [
      {
        html:"<select><option value='is'>is</option><option value='is_not'>is_not</option></select><input class='op_val' type='text' />",
        qualifiers:["requester_id","assignee_id","organization_id"]
      },
      {
        html:"<select><option value='includes'>includes</option><option value='not_includes'>does not include</option></select><input class='op_val' type='text' />",
        qualifiers:["current_tags"]
      },
      {
        html:"<select><option value='is'>is</option><option value='is_not'>is_not</option></select><select class='op_val'><option>-</option><option value='question'>Question</option><option value='incident'>Incident</option><option value='problem'>Problem</option><option value='task'>Task</option></select>",
        qualifiers:["ticket_type_id"]
      },
      {
        html:"<select><option value='is'>is</option><option value='is_not'>is_not</option></select><select class='op_val'><option value='new'>New</option><option value='open'>Open</option><option value='pending'>Pending</option><option value='solved'>Solved</option><option value='closed'>Closed</option>",
        qualifiers:["status_id"]
      },
      {
        html:"<select><option value='is'>is</option><option value='is_not'>is_not</option></select><select class='op_val'><option>-</option><option value='low'>Low</option><option value='normal'>Normal</option><option value='high'>High</option><option value='urgent'>Urgent</option></select>",
        qualifiers:["priority_id"]
      }
    ],

  	requests: {
      autocompleteRequester: function(name) {
        return {
          url: helpers.fmt('/api/v2/users/autocomplete.json?name=%@', name),
          type: 'GET'
        };
      },
      autocompleteOrganization: function(name) {
        return {
          url: helpers.fmt('/api/v2/organizations/autocomplete.json?name=%@', name),
          type: 'GET'
        };
      }
  	},

    activeNotifications: [
      {id: 1, name: "Here", otherStuff: {}},
      {id: 2, name: "Hello", otherStuff: {}},
      {id: 2, name: "Nope", otherStuff: {}},
      {id: 2, name: "Face Punch", otherStuff: {}}
    ],

    inactiveNotifications: [
      {id: 1, name: "I'm inactive", otherStuff: {}},
      {id: 2, name: "No this is boring", otherStuff: {}}
    ],

    events: {
      'app.activated':'index',
      'click #newNotification': 'newNotification',
      'click #cancelCreate': 'index',
      'change .chosen_dropdown': 'show_operation',
      'click #addAllCondition': 'addAllCondition',
      'click #addAnyCondition': 'addAnyCondition',
      'click .remove_condition': 'removeCondition'
    },

    allConditionsCounter: 0,
    anyConditionsCounter: 0,

    index: function(e) {
      e.preventDefault();
      var notifications = {
        active: this.activeNotifications,
        inactive: this.inactiveNotifications
      };

      this.switchTo('index', notifications);
    },

    newNotification: function(e) {
      e.preventDefault();

      this.allConditionsCounter = 0;
      this.anyConditionsCounter = 0;

      this.switchTo('new_notification', null);
    },

    addAllCondition: function(e) {
      e.preventDefault();
      this.allConditionsCounter += 1;
      var fieldset = this.renderTemplate('all_condition_fieldset', {id: this.allConditionsCounter});
      this.$('#all_conditions').append(fieldset);
    },

    removeCondition: function(e) {
      e.preventDefault();
      this.$(e.currentTarget).parents('fieldset').remove();
    },

    addAnyCondition: function(e) {
      e.preventDefault();
      this.anyConditionsCounter += 1;
      var fieldset = this.renderTemplate('any_condition_fieldset', {id: this.anyConditionsCounter});
      this.$('#any_conditions').append(fieldset);
    },

    show_operation: function(e) {
    	e.preventDefault();
      var selected = e.currentTarget;
      var current_option = e.currentTarget.value;
      var target = this.$(selected)[0];
      var op_obj = _.filter(this.operators, function(item){
        return item.qualifiers.indexOf(current_option) > -1;
      });
      var op_html = op_obj[0].html;
      var parent_id = this.$(target).parent().attr('id');
      var inserted = this.$(target).parent().children(".op_and_value").html(op_html);
      if (current_option == 'requester_id' || current_option == 'assignee_id') {
        this.$(inserted).children("input.op_val").addClass('autocomplete_user');
        this.autocompleteRequesterName(parent_id);
      }
      if (current_option == 'organization_id') {
        this.$(inserted).children("input.op_val").addClass('autocomplete_org');
        this.autocompleteOrganizationName(parent_id);
      }
    },

    autocompleteRequesterName: function(parent_id) {
      var self = this;
      var selector = helpers.fmt('#%@ .autocomplete_user', parent_id);
      this.$(selector).autocomplete({
        minLength: 3,
        source: function(request, response){
          self.ajax('autocompleteRequester', request.term).done(function(data){
            response(_.map(data.users, function(user) {
              return {
                "label": user.name,
                "value": user.id
              };
            }));
          });
        },
        select: function(event, ui) {
          event.preventDefault();
          self.$(selector).val(ui.item.label);
        },
        focus: function(event, ui) {
          event.preventDefault();
          self.$(selector).val(ui.item.label);
        }
      }, this);
    },

    autocompleteOrganizationName: function(parent_id) {
      var self = this;
      var selector = helpers.fmt('#%@ .autocomplete_org', parent_id);
      this.$(selector).autocomplete({
        minLength: 3,
        source: function(request, response){
          self.ajax('autocompleteOrganization', request.term).done(function(data){
            response(_.map(data.organizations, function(org) {
              return {
                "label": org.name,
                "value": org.id
              };
            }));
          });
        },
        select: function(event, ui) {
          event.preventDefault();
          self.$(selector).val(ui.item.label);
        },
        focus: function(event, ui) {
          event.preventDefault();
          self.$(selector).val(ui.item.label);
        }
      }, this);
    }
  };

}());
