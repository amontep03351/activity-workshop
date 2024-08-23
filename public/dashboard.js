$(document).ready(function() {
    // Initialize DataTable
    const table = $('#activitiesTable').DataTable({
        ajax: {
            url: '/api/activities',
            dataSrc: ''
        },
        columns: [
            { data: 'ActivityName' },
            { data: 'ActivityDes' },
            { data: 'ActivityRegisted' },
            { data: 'ActivitySum' },
            {
                data: null,
                defaultContent: '<button class="editBtn">Edit</button> <button class="deleteBtn">Delete</button>',
                orderable: false
            }
        ]
    });

    // Show Add Activity Modal
    $('#addActivityBtn').on('click', function() {
        $('#activityId').val('');
        $('#ActivityName').val('');
        $('#ActivityDes').val('');
        $('#ActivitySum').val('');
        $('#modalTitle').text('Add Activity');
        $('#activityModal').show();
    });

    // Save Activity
    $('#activityForm').on('submit', function(e) {
        e.preventDefault();

        const id = $('#activityId').val();
        const activity = {
            ActivityName: $('#ActivityName').val(),
            ActivityDes: $('#ActivityDes').val(),
            ActivityRegisted:0,
            ActivitySum: parseInt($('#ActivitySum').val())
        };

        if (id) {
            // Update existing activity
            $.ajax({
                url: `/api/activities/${id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(activity),
                success: function() {
                    table.ajax.reload();
                    $('#activityModal').hide();
                }
            });
        } else {
            // Add new activity
            $.ajax({
                url: '/api/activities',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(activity),
                success: function() {
                    table.ajax.reload();
                    $('#activityModal').hide();
                }
            });
        }
    });

    // Edit Button Click
    $('#activitiesTable').on('click', '.editBtn', function() {
        const data = table.row($(this).closest('tr')).data();
        $('#activityId').val(data._id);
        $('#ActivityName').val(data.ActivityName);
        $('#ActivityDes').val(data.ActivityDes);
        $('#ActivityRegisted').val(data.ActivityRegisted);
        $('#ActivitySum').val(data.ActivitySum);
        $('#modalTitle').text('Edit Activity');
        $('#activityModal').show();
    });

    // Delete Button Click
    $('#activitiesTable').on('click', '.deleteBtn', function() {
        const id = table.row($(this).closest('tr')).data()._id;

        if (confirm('Are you sure you want to delete this activity?')) {
            $.ajax({
                url: `/api/activities/${id}`,
                method: 'DELETE',
                success: function() {
                    table.ajax.reload();
                }
            });
        }
    });

    // Close Modal
    $('.close').on('click', function() {
        $('#activityModal').hide();
    });
});
